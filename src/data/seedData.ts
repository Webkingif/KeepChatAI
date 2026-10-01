import { ChatThread, SavedOutput } from '../types/keepchat';

export const INITIAL_CHATS: ChatThread[] = [
  {
    id: 'chat-1',
    title: 'Full-Stack Auth & Drizzle ORM',
    description: 'Architecture patterns for secure session management and database relations',
    category: 'Coding',
    defaultAiModel: 'ChatGPT',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
    updatedAt: Date.now() - 1000 * 60 * 35, // 35 mins ago
    isPinned: true,
    avatarColor: 'from-emerald-500 to-teal-700',
    iconName: 'code',
  },
  {
    id: 'chat-2',
    title: 'Gemini 2.5 Grounding & Prompts',
    description: 'System prompts, JSON schema enforcement, and search grounding recipes',
    category: 'Prompts',
    defaultAiModel: 'Gemini',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    updatedAt: Date.now() - 1000 * 60 * 120,
    isPinned: true,
    avatarColor: 'from-blue-500 to-indigo-700',
    iconName: 'sparkles',
  },
  {
    id: 'chat-3',
    title: 'Vector Databases Comparative Matrix',
    description: 'Benchmark analysis of Pinecone, pgvector, Qdrant, and Milvus for RAG',
    category: 'Architecture',
    defaultAiModel: 'Claude',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
    updatedAt: Date.now() - 1000 * 60 * 60 * 6,
    isPinned: false,
    avatarColor: 'from-amber-500 to-orange-700',
    iconName: 'database',
  },
  {
    id: 'chat-4',
    title: 'Autonomous Agent Workflows 2026',
    description: 'Research notes on memory compaction, tool reflection, and human-in-the-loop loops',
    category: 'Research',
    defaultAiModel: 'ChatGPT',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
    isPinned: false,
    avatarColor: 'from-purple-500 to-violet-700',
    iconName: 'brain',
  },
];

export const INITIAL_MESSAGES: SavedOutput[] = [
  {
    id: 'msg-1',
    chatId: 'chat-1',
    title: 'Next.js 15 + Drizzle Auth Schema & Session Management',
    userPrompt: 'Provide a robust TypeScript Drizzle ORM schema for users, sessions, and roles, plus a verification helper.',
    aiModel: 'ChatGPT',
    tags: ['Next.js', 'Drizzle', 'TypeScript', 'Auth'],
    isStarred: true,
    createdAt: Date.now() - 1000 * 60 * 35,
    tokenCountEstimate: 850,
    content: `### Production Schema: Users, Sessions & Role-Based Access Control

Here is the hardened schema implementation using **Drizzle ORM** with PostgreSQL. This model supports atomic session revocation and granular workspace permissions.

#### 1. Schema Definition (\`src/db/schema.ts\`)

\`\`\`typescript
import { pgTable, text, timestamp, uuid, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const roleEnum = pgEnum('user_role', ['admin', 'member', 'billing_viewer']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  displayName: text('display_name').notNull(),
  role: roleEnum('role').default('member').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(), // Cryptographically random 64-char hex string
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));
\`\`\`

#### 2. Session Validation Invariant

> **Security Note:** Never trust client-provided user IDs directly in cookies. Always validate the cryptographic session token against the database and check expiration on every sensitive request.

\`\`\`bash
# Run migration verification
npm run drizzle:push --strict
\`\`\`

#### 3. Technology Comparison

| Engine | Type Safety | Migration Control | Edge Runtime Support |
| :--- | :--- | :--- | :--- |
| **Drizzle ORM** | Native TypeScript SQL-first | Fine-grained SQL files | Zero-dependency, ultra-fast |
| **Prisma** | Generated client DSL | Schema push / migrate | Requires heavy engine binary |
| **Kysely** | Pure SQL query builder | Manual migration hooks | Exceptional lightweight |

All queries execute in sub-millisecond connection pools.`
  },
  {
    id: 'msg-2',
    chatId: 'chat-1',
    title: 'Client-Side Cookie Verification & Middleware',
    userPrompt: 'How should Edge middleware handle token extraction without hitting the database on static assets?',
    aiModel: 'ChatGPT',
    tags: ['Middleware', 'Edge', 'Security'],
    isStarred: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 20,
    tokenCountEstimate: 420,
    content: `### Edge Route Filtering Pattern

To ensure your Next.js middleware doesn't trigger database overhead for static assets or favicon requests, use path matcher exclusion:

\`\`\`typescript
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
\`\`\`

Key advantages:
- Reduces cold start latency to **under 5ms**
- Protects downstream APIs from malicious request flooding`
  },
  {
    id: 'msg-3',
    chatId: 'chat-2',
    title: 'Gemini 2.5 Flash Structured JSON Output Specification',
    userPrompt: 'Show me the exact system instruction and responseSchema config for extracting structured data using @google/genai.',
    aiModel: 'Gemini',
    tags: ['Gemini', 'JSON Schema', 'TypeScript', 'SDK'],
    isStarred: true,
    createdAt: Date.now() - 1000 * 60 * 120,
    tokenCountEstimate: 610,
    content: `### Enforcing Strict JSON Schemas with the Gemini TypeScript SDK

With **Gemini 2.5 Flash**, you can guarantee deterministic JSON output conforming to your schema by passing \`responseMimeType: "application/json"\` alongside \`responseSchema\`.

#### SDK Implementation

\`\`\`typescript
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI();

const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: 'Analyze the performance metrics for Q3 logistics report.',
  config: {
    systemInstruction: 'You are a meticulous financial analyst. Output pure verified JSON without markdown wrapping.',
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        quarter: { type: Type.STRING },
        overallEfficiencyScore: { type: Type.NUMBER },
        keyBottlenecks: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        actionItems: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              priority: { type: Type.STRING, enum: ['HIGH', 'MEDIUM', 'LOW'] },
              task: { type: Type.STRING },
              estimatedDays: { type: Type.INTEGER }
            },
            required: ['priority', 'task', 'estimatedDays']
          }
        }
      },
      required: ['quarter', 'overallEfficiencyScore', 'keyBottlenecks', 'actionItems']
    }
  }
});

const data = JSON.parse(response.text ?? '{}');
console.log('Structured output verified:', data);
\`\`\`

#### Best Practices:
1. **Never use regex parsing** on unstructured text when schema enforcement is supported natively.
2. Provide explicit enum constraints for status or priority fields.
3. System instruction should remind the model to obey structural types.`
  },
  {
    id: 'msg-4',
    chatId: 'chat-3',
    title: 'RAG Vector Index Architecture Comparison (2026)',
    userPrompt: 'Compare Pinecone, pgvector, Qdrant, and Milvus for production RAG pipelines with 500k documents.',
    aiModel: 'Claude',
    tags: ['Vector DB', 'RAG', 'Architecture'],
    isStarred: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    tokenCountEstimate: 950,
    content: `### Vector Database Architecture Decision Matrix

When building an enterprise Retrieval-Augmented Generation (RAG) system with $\\approx$ 500,000 vector embeddings (1536-dim or 768-dim), here is the decision matrix:

| Solution | Query Latency (p95) | Self-Hosted Option | Metadata Filtering | Operational Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **Qdrant** | \`~12ms\` | ✅ Native Docker / Rust | Exceptional payload filtering | Low / High control |
| **pgvector** | \`~28ms\` (HNSW) | ✅ Existing PostgreSQL | Standard SQL WHERE clauses | Zero additional infra |
| **Pinecone** | \`~18ms\` | ❌ Fully Managed Cloud | Fast pre-filtering | Minimal |
| **Milvus** | \`~15ms\` | ✅ Kubernetes Distributed | Advanced query expressions | Medium to High |

#### Key Recommendation:
- If you already run **PostgreSQL** in production: start with **pgvector with HNSW index** (\`m=16\`, \`ef_construction=64\`). You avoid running a separate database cluster.
- If you need **sub-15ms search across complex nested JSON metadata**: choose **Qdrant**.

\`\`\`sql
-- Creating HNSW index in pgvector for cosine similarity
CREATE INDEX ON document_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
\`\`\``
  },
  {
    id: 'msg-5',
    chatId: 'chat-4',
    title: 'Memory Compaction and Context Pruning in Agent Loops',
    userPrompt: 'How can an agent prevent infinite context growth while preserving critical user decisions?',
    aiModel: 'ChatGPT',
    tags: ['Agents', 'Memory', 'Context Window'],
    isStarred: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    tokenCountEstimate: 540,
    content: `### The 3-Tier Agentic Memory Protocol

To sustain long-running autonomous workflows across days of interaction without exceeding token budgets:

1. **Episodic Working Buffer**:
   - Recent 10 turns preserved verbatim.
   - High fidelity for immediate back-and-forth context.
2. **Semantic Milestone Log**:
   - Every time a user confirms an architectural decision, append an immutable decision bullet to the system prompt header.
3. **Recursive Summarization Tree**:
   - As working memory crosses 16k tokens, compress turns 1–8 into a succinct factual rollup.

> *"Context engineering is not about expanding windows; it is about ruthless relevance filtering."*`
  },
  {
    id: 'msg-6',
    chatId: 'chat-4',
    title: 'Quadratic Equation Derivation with Complex Roots',
    userPrompt: 'To find the roots of the quadratic equation x^2 + 5x + 8 = 0, calculate the discriminant and apply the quadratic formula.',
    aiModel: 'DeepSeek',
    tags: ['Math', 'LaTeX', 'Algebra'],
    isStarred: true,
    createdAt: Date.now() - 1000 * 60 * 15,
    tokenCountEstimate: 420,
    content: `To find the roots of the quadratic equation 

$$x^2 + 5x + 8 = 0$$

we can use the quadratic formula:

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

For this equation, the coefficients are:

* $a = 1$
* $b = 5$
* $c = 8$

**Step 1: Calculate the discriminant ($b^2 - 4ac$)**

$$b^2 - 4ac = (5)^2 - 4(1)(8)$$

$$b^2 - 4ac = 25 - 32$$

$$b^2 - 4ac = -7$$

**Step 2: Apply the quadratic formula**

Because the discriminant is negative ($-7$), the equation has no real solutions. Instead, it has two complex solutions involving the imaginary unit $i$ (where $i = \\sqrt{-1}$).

$$x = \\frac{-5 \\pm \\sqrt{-7}}{2(1)}$$

$$x = \\frac{-5 \\pm i\\sqrt{7}}{2}$$

**Final Answer:**

The two complex roots for the equation are:

$$x_1 = -\\frac{5}{2} + \\frac{\\sqrt{7}}{2}i$$

$$x_2 = -\\frac{5}{2} - \\frac{\\sqrt{7}}{2}i$$`
  },
  {
    id: 'msg-7',
    chatId: 'chat-4',
    title: 'LaTeX Bracket Delimiters \\[...\\] and Boxed Complex Roots',
    userPrompt: 'Solve x^2 + 5x + 8 = 0 using quadratic formula with boxed final answers.',
    aiModel: 'Claude',
    tags: ['Math', 'LaTeX', 'Boxed'],
    isStarred: true,
    createdAt: Date.now() - 1000 * 60 * 5,
    tokenCountEstimate: 380,
    content: `Solve using the quadratic formula:

\\[
x^2+5x+8=0
\\]

Here \\(a=1,\\ b=5,\\ c=8\\).

\\[
x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}
\\]

\\[
x=\\frac{-5\\pm\\sqrt{25-32}}{2}
\\]

\\[
x=\\frac{-5\\pm\\sqrt{-7}}{2}
\\]

Since \\(\\sqrt{-7}=i\\sqrt7\\),

\\[
\\boxed{x=\\frac{-5\\pm i\\sqrt7}{2}}
\\]

So there are no real solutions; the two complex solutions are

\\[
\\boxed{x_1=\\frac{-5+i\\sqrt7}{2},\\qquad x_2=\\frac{-5-i\\sqrt7}{2}}
\\]`
  }
];
