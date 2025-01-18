// Updated on Dec 18 2024
function findDatesOfBirth(text) {
    const dateRegex = new RegExp([
        // 1. DD(st|nd|rd|th)? (of )?Month YYYY (All parts required)
        "\\b(\\d{1,2})(st|nd|rd|th)?\\s*(of\\s+)?(January|Jan|February|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|August|Aug|September|Sept|October|Oct|November|Nov|December|Dec)\\s*,?\\s*(\\d{4})\\b",
        // 2. Month DD(st|nd|rd|th)? YYYY (All parts required)
        "\\b(January|Jan|February|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|August|Aug|September|Sept|October|Oct|November|Nov|December|Dec)\\s*(\\d{1,2})(st|nd|rd|th)?\\s*,?\\s*(\\d{4})\\b",
        // 3. Numeric formats (All parts required)
        //    DD[-/.]MM[-/.]YYYY or YYYY[-/.]MM[-/.]DD
        "\\b(\\d{1,2})[-/. ](\\d{1,2})[-/. ](\\d{4})\\b",
        "\\b(\\d{4})[-/. ](\\d{1,2})[-/. ](\\d{1,2})\\b",
        // 4. YYYY Month DD(st|nd|rd|th)? (All parts required)
        "\\b(\\d{4})\\s+(January|Jan|February|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|August|Aug|September|Sept|October|Oct|November|Nov|December|Dec)\\s+(\\d{1,2})(st|nd|rd|th)?\\b"
    ].join("|"), "gi");

    const contextRegex = /\b(bday|born|date of birth|dateofbirth|day of birth|dob|birthdate|birth date|birthday|birth day|was born on|born on|natal day|he was born|she was born|his birth|her birth|his birth date|her birth date)\b/i;

    const dates = [];
    let match;
    while ((match = dateRegex.exec(text)) !== null) {
        const date = match[0];
        const beforeDate = text.slice(Math.max(match.index - 60, 0), match.index);
        const afterDate = text.slice(match.index + date.length, Math.min(match.index + date.length + 60, text.length));
        const surroundingText = beforeDate + afterDate;

        // Only push if the surrounding text indicates a birth context
        if (contextRegex.test(surroundingText)) {
            dates.push({
                text: date,
                start: match.index,
                end: match.index + date.length
            });
        }
    }
    return dates;
}


function findPII(text) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    const macAddressRegex = /\b(?:[A-Fa-f0-9]{2}[:.-]){5}[A-Fa-f0-9]{2}\b/g;

    const emails = [];
    const macAddresses = [];
    let match;
    const excludedEmails = ['aweb@gmail.com'];

    // Capture emails
    while ((match = emailRegex.exec(text)) !== null) {
        // Ensure the match is not part of an empty "Cc:" or similar
        const beforeMatch = text.slice(Math.max(0, match.index - 5), match.index).trim();
        const email = match[0].trim();
        if ((!/^cc:|bcc:|to:|from:$/i.test(beforeMatch) || email !== '') && !excludedEmails.includes(email)) {
            emails.push({
                text: match[0],
                start: match.index,
                end: match.index + match[0].length + 1
            });
        }
    }

    // Reset regex lastIndex to ensure it doesn't interfere with subsequent captures
    emailRegex.lastIndex = 0;

    // Capture MAC addresses
    while ((match = macAddressRegex.exec(text)) !== null) {
        macAddresses.push({
            text: match[0],
            start: match.index,
            end: match.index + match[0].length + 1
        });
    }

    return {
        emails,
        macAddresses
    };
}


function extractNames(text) {
    const doc = nlp(text);
    const names = [];
    const seenIndices = new Set(); // Track processed positions

    const people = doc.people().out('array'); // Extract unique names
    people.forEach(name => {
        let start = 0;

        // Use a loop to find all occurrences of each name
        while ((start = text.indexOf(name, start)) !== -1) {
            const end = start + name.length;

            // Add only if this position hasn't been processed
            if (!seenIndices.has(start)) {
                seenIndices.add(start);
                names.push({
                    text: name,
                    start,
                    end
                });
            }

            // Move to the next position
            start = end;
        }
    });

    return names;
}

// Updated on Dec 30th
function extractAddresses(text) {
    const addresses = [];

    const streetRegex = new RegExp(
        "\\b\\d{1,5}\\s" +                       // House number
        "(?:[A-Za-z0-9.,'\\-]+\\s)*" +           // Street name
        "[A-Za-z]{2,}\\b" +                      // Require at least one word with two or more letters
        "\\s" +                                  // Space before suffix
        "(?:St|St\\.|Street|Rd|Rd\\.|Road|Ave|Ave\\.|Av|Av\\.|Avenue|" +
        "Blvd|Boulevard|Ln|Ln\\.|Lane|Dr|Dr\\.|Drive|Pl|Pl\\.|Place|" +
        "Terr|Terr\\.|Terrace|Ct|Ct\\.|Court|Cres|Crescent|Pkwy|Parkway|" +
        "Cir|Circle|Hwy|Hwy\\.|Highway|Way|Wy|Sq|Sq\\.|Square)" +
        "\\b" +
        "(?:,?\\s*(?:Apt|Unit|Suite|Fl|Floor|#)\\s*\\w+)?", // Optional unit details
        "i"
    );

    const cityStateRegex = [
        "[A-Za-z]+(?:\\s+[A-Za-z]+)*",            // City name (multiple words)
        ",?\\s*",                                 // Optional comma and whitespace
        "(?:[A-Z]{2}|[A-Za-z]+(?:\\s+[A-Za-z]+)*)" // State (2-letter code or full name)
    ].join("");

    const zipRegex = "\\b\\d{5}(?:-\\d{4})?\\b"; // 5-digit ZIP, optional 4-digit extension

    const addressPattern = new RegExp(
        "(?:^|(?<=[\\n\\s,.]))" +                // Ensure address starts after whitespace, newline, or punctuation
        "(?<![a-zA-Z0-9,.])" +                   // Avoid extra preceding content that isn't a valid delimiter
        streetRegex.source +                     // Match street and optional unit
        "[,\\s]+" +                              // Separator
        cityStateRegex +                         // Match city and state
        "[,\\s]+" +                              // Separator
        zipRegex +                               // Match ZIP code
        "(?=$|[\\n\\s,.])",                      // Ensure address ends with whitespace, newline, or punctuation
        "gi"
    );

    let match;
    while ((match = addressPattern.exec(text)) !== null) {
        let extracted = match[0].trim();

        // Ensure only clean address data is captured
        if (extracted.match(streetRegex) && extracted.match(zipRegex) && !'29 Main St, MA 23440'.includes(extracted)) {
            addresses.push({
                text: extracted,
                start: match.index,
                end: match.index + match[0].length + 1
            });
        }

        if (addressPattern.lastIndex === match.index) {
            addressPattern.lastIndex++;
        }
    }

    return addresses;
}

function findPhoneNumbers(text) {
    // Match phone numbers in various formats
    const phoneRegex = /\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;

    const excludedPhoneNumbers = ['222-431-3040']; // List of phone numbers to exclude

    const phoneNumbers = [];
    let match;

    while ((match = phoneRegex.exec(text)) !== null) {
        const phoneNumber = match[0].trim();

        // Skip excluded phone numbers
        if (!excludedPhoneNumbers.includes(phoneNumber)) {
            phoneNumbers.push({
                text: phoneNumber,
                start: match.index,
                end: match.index + phoneNumber.length + 1
            });
        }
    }

    return phoneNumbers;
}



function findSSNs(text) {
    const ssnRegex = /\b\d{3}[-.\s/]*\d{2}[-.\s/]*\d{4}\b/g;
    const contextKeywords = /\b(SSN|Social Security|Social Security Number|Social Security Num|Social Sec Num|Social Sec. Num.|Social Security Num.|SSN#)\b/i;

    function isValidSSN(ssn) {
        const cleanSSN = ssn.replace(/[-.\s/]/g, '');
        const segments = [cleanSSN.substring(0, 3), cleanSSN.substring(3, 5), cleanSSN.substring(5)];
        if (segments[0] === '000' || segments[1] === '00' || segments[2] === '0000') {
            return false;
        }
        return true;
    }

    function hasContext(text, index) {
        const contextWindow = 30;
        const start = Math.max(0, index - contextWindow);
        const end = Math.min(text.length, index + contextWindow);
        const surroundingText = text.substring(start, end);
        return contextKeywords.test(surroundingText);
    }

    const ssns = [];
    let match;

    while ((match = ssnRegex.exec(text)) !== null) {
        const ssn = match[0];
        const index = match.index;

        if (isValidSSN(ssn) && hasContext(text, index)) {
            ssns.push({
                text: ssn,
                start: index,
                end: index + ssn.length + 1
            });
        }
    }

    return ssns;
}

// Combined function to extract all PII
function extractAllPII(text) {
    const datesOfBirth = findDatesOfBirth(text);
    const pii = findPII(text);
    const names = extractNames(text);
    const addresses = extractAddresses(text);
    const ssns = findSSNs(text);
    const phoneNumbers = findPhoneNumbers(text);

    return {
        datesOfBirth,
        emails: pii.emails,
        macAddresses: pii.macAddresses,
        names,
        addresses,
        ssns,
        phoneNumbers
    };
}