// Local RxDB entry point that uses dynamic imports to avoid Vite resolution issues
let dbInstance = null;
let rxdbModules = null;

async function getRxDBModules() {
    if (rxdbModules) return rxdbModules;
    
    rxdbModules = await Promise.all([
        import('rxdb'),
        import('rxdb/plugins/storage-dexie'),
        import('rxdb/plugins/query-builder'),
        import('rxdb/plugins/update')
    ]);
    
    const [
        { createRxDatabase, addRxPlugin },
        { getRxStorageDexie },
        { RxDBQueryBuilderPlugin },
        { RxDBUpdatePlugin }
    ] = rxdbModules;
    
    // Add plugins
    addRxPlugin(RxDBQueryBuilderPlugin);
    addRxPlugin(RxDBUpdatePlugin);
    
    return {
        createRxDatabase,
        getRxStorageDexie
    };
}

// Schema Definitions
const studentSchema = {
    version: 0,
    primaryKey: '$id',
    type: 'object',
    properties: {
        $id: { type: 'string', maxLength: 100 },
        schoolId: { type: 'string' },
        studentId: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string' },
        classId: { type: 'string' },
        enrollmentStatus: { type: 'string' },
        parentEmail: { type: 'string' },
        parentPhone: { type: 'string' },
        dateOfBirth: { type: 'string' },
        gender: { type: 'string' },
        updatedAt: { type: 'string' },
        createdAt: { type: 'string' }
    },
    required: ['$id', 'schoolId', 'firstName', 'lastName']
};

const staffSchema = {
    version: 0,
    primaryKey: '$id',
    type: 'object',
    properties: {
        $id: { type: 'string', maxLength: 100 },
        schoolId: { type: 'string' },
        staffId: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string' },
        department: { type: 'string' },
        role: { type: 'string' },
        phone: { type: 'string' },
        updatedAt: { type: 'string' },
        createdAt: { type: 'string' }
    },
    required: ['$id', 'schoolId', 'firstName', 'lastName']
};

const subjectSchema = {
    version: 0,
    primaryKey: '$id',
    type: 'object',
    properties: {
        $id: { type: 'string', maxLength: 100 },
        schoolId: { type: 'string' },
        name: { type: 'string' },
        code: { type: 'string' },
        category: { type: 'string' },
        description: { type: 'string' },
        updatedAt: { type: 'string' },
        createdAt: { type: 'string' }
    },
    required: ['$id', 'schoolId', 'name']
};

const classSchema = {
    version: 0,
    primaryKey: '$id',
    type: 'object',
    properties: {
        $id: { type: 'string', maxLength: 100 },
        schoolId: { type: 'string' },
        name: { type: 'string' },
        level: { type: 'string' },
        formTeacherId: { type: 'string' },
        updatedAt: { type: 'string' },
        createdAt: { type: 'string' }
    },
    required: ['$id', 'schoolId', 'name']
};

const gradingSchemeSchema = {
    version: 0,
    primaryKey: '$id',
    type: 'object',
    properties: {
        $id: { type: 'string', maxLength: 100 },
        schoolId: { type: 'string' },
        name: { type: 'string' },
        grades: { type: 'array', items: { type: 'object' } },
        scoreComponents: { type: 'array', items: { type: 'object' } },
        isDefault: { type: 'boolean' },
        updatedAt: { type: 'string' },
        createdAt: { type: 'string' }
    },
    required: ['$id', 'schoolId', 'name']
};

const resultSchema = {
    version: 0,
    primaryKey: '$id',
    type: 'object',
    properties: {
        $id: { type: 'string', maxLength: 100 },
        schoolId: { type: 'string' },
        studentId: { type: 'string' },
        classId: { type: 'string' },
        subjectId: { type: 'string' },
        academicSession: { type: 'string' },
        term: { type: 'string' },
        scores: { type: 'object' },
        totalScore: { type: 'number' },
        grade: { type: 'string' },
        remark: { type: 'string' },
        isApproved: { type: 'boolean' },
        isPublished: { type: 'boolean' },
        updatedAt: { type: 'string' },
        createdAt: { type: 'string' }
    },
    required: ['$id', 'schoolId', 'studentId', 'subjectId']
};

const chatMessageSchema = {
    version: 0,
    primaryKey: '$id',
    type: 'object',
    properties: {
        $id: { type: 'string', maxLength: 100 },
        schoolId: { type: 'string' },
        senderId: { type: 'string' },
        senderName: { type: 'string' },
        senderRole: { type: 'string' },
        message: { type: 'string' },
        channel: { type: 'string' },
        createdAt: { type: 'string' },
        synced: { type: 'boolean' }
    },
    required: ['$id', 'schoolId', 'senderId', 'message', 'channel']
};

const emailSendSchema = {
    version: 0,
    primaryKey: '$id',
    type: 'object',
    properties: {
        $id: { type: 'string', maxLength: 100 },
        schoolId: { type: 'string' },
        recipients: { type: 'array', items: { type: 'string' } },
        subject: { type: 'string' },
        body: { type: 'string' },
        status: { type: 'string', enum: ['pending', 'sent', 'failed'] },
        errorMessage: { type: 'string' },
        sentBy: { type: 'string' },
        sentAt: { type: 'string' },
        createdAt: { type: 'string' }
    },
    required: ['$id', 'schoolId', 'recipients', 'subject']
};

const pinSchema = {
    version: 0,
    primaryKey: '$id',
    type: 'object',
    properties: {
        $id: { type: 'string', maxLength: 100 },
        schoolId: { type: 'string' },
        studentId: { type: 'string' },
        pin: { type: 'string' },
        academicSession: { type: 'string' },
        term: { type: 'string' },
        isUsed: { type: 'boolean' },
        usedAt: { type: 'string' },
        paymentStatus: { type: 'string', enum: ['pending', 'paid', 'school_paid'] },
        updatedAt: { type: 'string' },
        createdAt: { type: 'string' }
    },
    required: ['$id', 'schoolId', 'studentId', 'pin']
};

export async function initRxDB() {
    if (dbInstance) return dbInstance;

    const { createRxDatabase, getRxStorageDexie } = await getRxDBModules();

    const db = await createRxDatabase({
        name: 'academicx_db',
        storage: getRxStorageDexie(),
        multiInstance: false,
        ignoreDuplicate: true
    });

    // Create collections
    await db.addCollections({
        students: { schema: studentSchema },
        staff: { schema: staffSchema },
        subjects: { schema: subjectSchema },
        classes: { schema: classSchema },
        gradingSchemes: { schema: gradingSchemeSchema },
        results: { schema: resultSchema },
        chatMessages: { schema: chatMessageSchema },
        emailSends: { schema: emailSendSchema },
        pins: { schema: pinSchema }
    });

    dbInstance = db;
    return db;
}

export function getRxDB() {
    return dbInstance;
}

// Helper functions for CRUD operations
export async function upsertDocument(collectionName, doc) {
    const db = await initRxDB();
    const collection = db[collectionName];
    if (!collection) throw new Error(`Collection ${collectionName} not found`);
    
    return collection.upsert({
        ...doc,
        updatedAt: new Date().toISOString()
    });
}

export async function bulkUpsert(collectionName, docs) {
    const db = await initRxDB();
    const collection = db[collectionName];
    if (!collection) throw new Error(`Collection ${collectionName} not found`);
    
    const timestamp = new Date().toISOString();
    const docsWithTimestamps = docs.map(doc => ({
        ...doc,
        updatedAt: timestamp
    }));
    
    return collection.bulkUpsert(docsWithTimestamps);
}

export async function findBySchoolId(collectionName, schoolId) {
    const db = await initRxDB();
    const collection = db[collectionName];
    if (!collection) throw new Error(`Collection ${collectionName} not found`);
    
    return collection.find({
        selector: { schoolId }
    }).exec();
}

export async function findOne(collectionName, id) {
    const db = await initRxDB();
    const collection = db[collectionName];
    if (!collection) throw new Error(`Collection ${collectionName} not found`);
    
    return collection.findOne(id).exec();
}

export async function removeDocument(collectionName, id) {
    const db = await initRxDB();
    const collection = db[collectionName];
    if (!collection) throw new Error(`Collection ${collectionName} not found`);
    
    const doc = await collection.findOne(id).exec();
    if (doc) {
        return doc.remove();
    }
}

// Reactive query helper
export function watchCollection(collectionName, schoolId, callback) {
    initRxDB().then(db => {
        const collection = db[collectionName];
        if (!collection) return;
        
        const query = collection.find({
            selector: { schoolId }
        });
        
        query.$.subscribe(docs => {
            callback(docs.map(d => d.toMutableJSON()));
        });
    });
}

// Hydrate from Appwrite data
export async function hydrateCollection(collectionName, appwriteDocs) {
    if (!appwriteDocs || !Array.isArray(appwriteDocs)) return;
    
    const docs = appwriteDocs.map(doc => ({
        ...doc,
        $id: doc.$id,
        updatedAt: doc.$updatedAt || new Date().toISOString(),
        createdAt: doc.$createdAt || new Date().toISOString()
    }));
    
    return bulkUpsert(collectionName, docs);
}
