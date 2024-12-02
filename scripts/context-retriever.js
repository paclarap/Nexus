#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class NexusContextRetriever {
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.contextFile = path.join(projectRoot, '.nexus-context.yml');
    }

    retrieveFullContext() {
        try {
            // Read YAML context file
            const contextContent = fs.readFileSync(this.contextFile, 'utf8');
            const context = yaml.load(contextContent);

            // Gather additional context from logs
            const logFiles = this.collectLogFiles();

            return {
                metadata: context,
                logs: logFiles
            };
        } catch (error) {
            console.error('Failed to retrieve context:', error);
            return null;
        }
    }

    collectLogFiles() {
        const logPaths = [
            path.join(this.projectRoot, 'logs'),
            ...this.getModuleLogPaths()
        ];

        return logPaths.reduce((logs, logDir) => {
            if (fs.existsSync(logDir)) {
                const files = fs.readdirSync(logDir)
                    .filter(file => file.endsWith('.md'))
                    .map(file => path.join(logDir, file));
                return [...logs, ...files];
            }
            return logs;
        }, []);
    }

    getModuleLogPaths() {
        const modulesDir = path.join(this.projectRoot, 'packages');
        return fs.readdirSync(modulesDir)
            .map(module => path.join(modulesDir, module, 'logs'));
    }

    // Syntax-aware context extraction
    extractContextSyntax(content) {
        // Custom syntax parsing logic
        const contextSyntaxRegex = /\[\[CONTEXT:(\w+)\]\](.*?)\[\[\/CONTEXT\]\]/gs;
        const matches = [...content.matchAll(contextSyntaxRegex)];
        
        return matches.map(match => ({
            type: match[1],
            content: match[2].trim()
        }));
    }

    // Security scan for sensitive information
    securityScan(content) {
        // Placeholder for future secure scanning
        return true;
    }
}

// Export for potential use in other scripts
module.exports = NexusContextRetriever;

// If run directly, output context
if (require.main === module) {
    const retriever = new NexusContextRetriever(process.cwd());
    console.log(JSON.stringify(retriever.retrieveFullContext(), null, 2));
}
