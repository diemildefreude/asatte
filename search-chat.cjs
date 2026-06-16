const fs = require('fs');
const readline = require('readline');
const query = process.argv[2];

if (!query) {
    console.error("\x1b[31mPlease provide a search query.\x1b[0m");
    process.exit(1);
}

const logPath = "C:\\Users\\selli\\.gemini\\antigravity\\brain\\f6553b67-bf12-4bbd-985f-fe9880abbfd5\\.system_generated\\logs\\transcript.jsonl";

if (!fs.existsSync(logPath)) {
    console.error("\x1b[31mTranscript file not found!\x1b[0m");
    process.exit(1);
}

console.log(`\x1b[33mSearching chat for: '${query}'...\x1b[0m\n========================================\n`);

let found = false;

const rl = readline.createInterface({
    input: fs.createReadStream(logPath),
    crlfDelay: Infinity
});

rl.on('line', (line) => {
    try {
        const json = JSON.parse(line);
        if (json.content && json.content.toLowerCase().includes(query.toLowerCase())) {
            found = true;
            const sender = json.source === 'USER_EXPLICIT' ? 'You' : 'Antigravity';
            const color = sender === 'You' ? '\x1b[32m' : '\x1b[36m'; // Green for user, Cyan for Antigravity
            console.log(`${color}[${json.created_at}] ${sender}\x1b[0m`);
            console.log(json.content);
            console.log(`\x1b[90m\n----------------------------------------\n\x1b[0m`);
        }
    } catch (e) {
        // Ignore JSON parsing errors for malformed lines
    }
});

rl.on('close', () => {
    if (!found) {
        console.log(`\x1b[31mNo results found for '${query}'.\x1b[0m`);
    }
});
