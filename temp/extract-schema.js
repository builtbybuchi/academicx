/**
 * AcademicX - Schema Extraction Script
 *
 * Run:  node extract-schema.js
 *
 * Extracts the current database schema from Appwrite and outputs it
 * in the same format as schema.js for easy comparison.
 *
 * Required env vars (same as setup-appwrite.js):
 *   APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY
 */

require('dotenv').config();
const { Client, Databases } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

const ENDPOINT = process.env.APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID || 'academicx_db';

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
    console.error('❌ Missing APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, or APPWRITE_API_KEY');
    process.exit(1);
}

const client = new Client();
client.setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
const databases = new Databases(client);

function mapAttributeType(attr) {
    if (attr.format) {
        if (attr.format === 'enum') return { type: 'enum', elements: attr.elements || [] };
        if (attr.format === 'datetime') return { type: 'datetime' };
        if (attr.format === 'email') return { type: 'string', size: attr.size || 255 };
        if (attr.format === 'url') return { type: 'string', size: attr.size || 1000 };
    }
    
    const typeMap = {
        string: { type: 'string', size: attr.size || 255 },
        integer: { type: 'integer' },
        double: { type: 'float' },
        boolean: { type: 'boolean' },
        datetime: { type: 'datetime' }
    };
    
    return typeMap[attr.type] || { type: attr.type, size: attr.size };
}

function formatValue(val) {
    if (val === null || val === undefined) return undefined;
    if (typeof val === 'string') return `'${val.replace(/'/g, "\\'")}'`;
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val;
    if (Array.isArray(val)) return JSON.stringify(val);
    return val;
}

async function extractSchema() {
    console.log('🔍 Extracting schema from Appwrite...\n');
    
    const collections = [];
    let offset = 0;
    const limit = 100;
    
    while (true) {
        const response = await databases.listCollections(DATABASE_ID, undefined, undefined, offset, limit);
        collections.push(...response.collections);
        
        if (response.collections.length < limit) break;
        offset += limit;
    }
    
    const extractedCollections = {};
    
    for (const coll of collections) {
        console.log(`📦 ${coll.name} (${coll.$id})`);
        
        // Get attributes
        const attrsResponse = await databases.listAttributes(DATABASE_ID, coll.$id);
        const attributes = [];
        
        for (const attr of attrsResponse.attributes) {
            const base = {
                key: attr.key,
                required: attr.required || false,
            };
            
            const mapped = mapAttributeType(attr);
            Object.assign(base, mapped);
            
            if (attr.default !== undefined && attr.default !== null) {
                base.default = attr.default;
            }
            if (attr.array) {
                base.array = true;
            }
            
            attributes.push(base);
        }
        
        // Get indexes
        const idxResponse = await databases.listIndexes(DATABASE_ID, coll.$id);
        const indexes = idxResponse.indexes.map(idx => ({
            key: idx.key,
            type: idx.type,
            attributes: idx.attributes
        }));
        
        extractedCollections[coll.$id.toUpperCase().replace(/-/g, '_')] = {
            id: coll.$id,
            name: coll.name,
            attributes,
            indexes
        };
    }
    
    // Generate schema.js content
    const output = `/**
 * AcademicX - Extracted Database Schema
 * Generated: ${new Date().toISOString()}
 */

const DATABASE_ID = '${DATABASE_ID}';
const BUCKET_ID = 'school_media';

const COLLECTIONS = {
${Object.entries(extractedCollections).map(([key, coll]) => {
    const attrs = coll.attributes.map(a => {
        const entries = Object.entries(a).map(([k, v]) => {
            const formatted = formatValue(v);
            return formatted !== undefined ? `            ${k}: ${formatted}` : null;
        }).filter(Boolean);
        return `        {\n${entries.join(',\n')},\n        }`;
    }).join(',\n');
    
    const idxs = coll.indexes.map(i => 
        `        { key: '${i.key}', type: '${i.type}', attributes: ${JSON.stringify(i.attributes)} }`
    ).join(',\n');
    
    return `    // ${coll.name}
    ${key}: {
        id: '${coll.id}',
        name: '${coll.name}',
        attributes: [
${attrs}
        ],
        indexes: [
${idxs}
        ],
    },`;
}).join('\n\n')}
};

module.exports = { DATABASE_ID, BUCKET_ID, COLLECTIONS };
`;
    
    const outputPath = path.join(__dirname, 'database', 'schema.extracted.js');
    fs.writeFileSync(outputPath, output);
    
    console.log(`\n✅ Schema extracted to: ${outputPath}`);
    console.log('\nCompare with your current schema.js:');
    console.log('  diff -u database/schema.js database/schema.extracted.js');
}

extractSchema().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});