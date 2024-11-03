// const nlp = require('compromise');

function findDatesOfBirth(text) {
    const dateRegex = /\b(\d{1,2})(st|nd|rd|th)?\s*(of\s+)?(January|Jan|February|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|August|Aug|September|Sept|October|Oct|November|Nov|December|Dec)\s*(,?\s*\d{4})\b|\b(January|Jan|February|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|August|Aug|September|Sept|October|Oct|November|Nov|December|Dec)\s*(\d{1,2})(st|nd|rd|th)?\s*(,?\s*\d{4})?\b|\b(\d{1,4})[-/. ](\d{1,2})[-/. ](\d{1,4})\b/gi;
    const contextRegex = /\b(bday|born|date of birth|dateofbirth|day of birth|dob|age|birthdate|birth date|birthday|birth day|was born on|born on)\b/i;
    const dates = [];
    let match;
    while ((match = dateRegex.exec(text)) !== null) {
        const date = match[0];
        const beforeDate = text.slice(Math.max(match.index - 50, 0), match.index);
        const afterDate = text.slice(match.index + date.length, Math.min(match.index + date.length + 50, text.length));
        const surroundingText = beforeDate + afterDate;
        if (contextRegex.test(surroundingText)) {
            dates.push(date);
        }
    }
    return dates;
}

function findPII(text) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const macAddressRegex = /\b(?:[A-Fa-f0-9]{2}[:.-]){5}[A-Fa-f0-9]{2}\b/g;
    const emails = text.match(emailRegex) || [];
    const macAddresses = text.match(macAddressRegex) || [];
    return {
        emails: emails,
        macAddresses: macAddresses
    };
}

function extractNames(text) {
    const doc = nlp(text);
    const people = doc.people().out('array');
    return people;
}

function extractAddresses(text) {
    const addresses = [];
    const streetRegex = /\b\d{1,5}\s(?:[A-Za-z0-9.,#\- ]+)\s(?:St|Street|Rd|Road|Ave|Avenue|Blvd|Boulevard|Ln|Lane|Dr|Drive|Pl|Place|Terr|Terrace|Ct|Court|Cres|Crescent|Pkwy|Parkway|Cir|Circle|Hwy|Highway|Way|Wy|Sq|Square|Tech Park|Hill)\b(?:,?\s*(?:Apt|Building|lot|Bldg|Level|lvl|lv|Block|blk|Apartment|Suite|Ste|Unit|Fl|Floor|#)?\s*[A-Za-z0-9\-]*)?/gi;
    const cityStateRegex = /\b[A-Z][a-zA-Z\s]*,\s*[A-Z]{2}\b/gi;
    const zipRegex = /\b\d{5}(?:-\d{4})?\b/gi;
    const addressPattern = new RegExp(`${streetRegex.source},?\\s*${cityStateRegex.source},?\\s*${zipRegex.source}`, 'gi');
    let match;
    while ((match = addressPattern.exec(text)) !== null) {
        addresses.push(match[0].trim());
    }
    const filteredAddresses = addresses.filter(address => {
        const businessKeywords = /\b(Suite|Ste|Office|Branch|Headquarters|Corp|Corporation|Business|Center|Plaza|Mall|Company|Co|Factory|Outlet|Store|Market|Gallery)\b/i;

        if (businessKeywords.test(address)) {
            return false;
        }
        const addressStartIndex = text.indexOf(address);
        const surroundingText = text.substring(Math.max(0, addressStartIndex - 50), addressStartIndex + address.length + 50);
        const contextKeywords = /\b(office|business|headquarters|branch|store|facility|company)\b/i;
        if (contextKeywords.test(surroundingText)) {
            return false;
        }
        const piiContextKeywords = /\b(home|residence|private|personal|house|living|lives|apt|apartment)\b/i;
        if (piiContextKeywords.test(surroundingText)) {
            return true;
        }
        const residentialKeywords = /\b(Apartment|Apt|Residence|Home)\b/i;
        if (residentialKeywords.test(address)) {
            return true;
        }
        return true;
    });
    return filteredAddresses;
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
    const matches = text.match(ssnRegex) || [];
    const validSSNs = matches.filter((ssn) => {
        const index = text.indexOf(ssn);
        const isContinuousFormat = ssn.includes('-') || ssn.includes('.') || ssn.includes('/') || ssn.includes(' ');
        if (isValidSSN(ssn)) {
            return isContinuousFormat ? true : hasContext(text, index);
        }
        return false;
    });
    return validSSNs;
}

// Combined function to extract all PII
function extractAllPII(text) {
    const datesOfBirth = findDatesOfBirth(text);
    const pii = findPII(text);
    const names = extractNames(text);
    const addresses = extractAddresses(text);
    const ssns = findSSNs(text);
    
    return {
        datesOfBirth: datesOfBirth,
        emails: pii.emails,
        macAddresses: pii.macAddresses,
        names: names,
        addresses: addresses,
        ssns: ssns
    };
}

// Example usage
// const text = `

// Hi ChatGPT! I need help with organizing a surprise party for my friend Sarah. Her birthday is on August 12, 1993, and I was thinking of sending out invitations to some of her friends. Could you help me draft an invitation email?

// Also, I have a list of her friends with their emails:

// John Doe: john.doe@example.com
// Jane Smith: jane.smith@anothermail.com
// Mike Johnson: mike.johnson@workplace.com
// The party will be at Sarah's place, 123 Main Street, Apartment 7B, Hometown, NY 12345. Should I include her phone number in the invitation for RSVPs? It's (123) 456-7890.

// Lastly, I've set up a Wi-Fi network for the party, and the MAC address is 00:1A:2B:3C:4D:5E. Could you remind me to share the password with the guests?

// `;

// const allPII = extractAllPII(text);
// console.log("All PII:", allPII);