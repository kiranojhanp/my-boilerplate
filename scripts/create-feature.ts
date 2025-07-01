#!/usr/bin/env bun

/**
 * 🎯 LLM-Optimized Feature Generator
 * Creates new features using the consolidated, token-efficient structure
 * 
 * Usage: bun run scripts/create-feature.ts <featureName>
 */

import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const featureName = process.argv[2];

if (!featureName) {
  console.error("Please provide a feature name: bun run scripts/create-feature.ts <featureName>");
  process.exit(1);
}

const capitalizedName = featureName.charAt(0).toUpperCase() + featureName.slice(1);
const featuresDir = join(process.cwd(), "src", "features", featureName);

async function createLLMOptimizedFeature() {
  try {
    // Create feature directory
    await mkdir(featuresDir, { recursive: true });

    // 1. Create types.ts - All schemas and types
    const typesContent = `/**
 * 🏷️ ${capitalizedName.toUpperCase()} TYPES
 * All TypeScript types and Zod schemas for ${featureName} feature
 * Shared between backend and frontend
 */

import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
// Import your database schema when ready
// import { ${featureName}s } from "@/backend/schemas";

// ===== ZOD SCHEMAS =====
// TODO: Replace with auto-generated schemas from Drizzle
export const ${capitalizedName}Schema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const Create${capitalizedName}InputSchema = ${capitalizedName}Schema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1, "Name is required").max(200),
});

export const Update${capitalizedName}InputSchema = Create${capitalizedName}InputSchema.partial().extend({
  id: z.string().min(1, "${capitalizedName} ID is required"),
});

export const ${capitalizedName}IdSchema = z.object({
  id: z.string().min(1, "${capitalizedName} ID is required"),
});

// ===== TYPESCRIPT TYPES =====
export type ${capitalizedName} = z.infer<typeof ${capitalizedName}Schema>;
export type Create${capitalizedName}Input = z.infer<typeof Create${capitalizedName}InputSchema>;
export type Update${capitalizedName}Input = z.infer<typeof Update${capitalizedName}InputSchema>;
`;

    // 2. Create backend.ts - Complete server logic
    const backendContent = `/**
 * 🖥️ ${capitalizedName.toUpperCase()} BACKEND
 * All server-side logic for ${featureName} feature
 * - Database operations (${capitalizedName}Service)
 * - Business logic  
 * - tRPC routes (${featureName}Router)
 */

import { router, loggedProcedure } from "@/backend/trpc";
import { db } from "@/backend/database";
// TODO: Import your database schema
// import { ${featureName}s } from "@/backend/schemas";
import { logger } from "@/backend/utils";
import { eq } from "drizzle-orm";
import {
  Create${capitalizedName}InputSchema,
  Update${capitalizedName}InputSchema,
  ${capitalizedName}IdSchema,
} from "./types";
import type {
  ${capitalizedName},
  Create${capitalizedName}Input,
  Update${capitalizedName}Input,
} from "./types";

// ===== ${capitalizedName.toUpperCase()} SERVICE =====
export class ${capitalizedName}Service {
  static async create${capitalizedName}(data: Create${capitalizedName}Input): Promise<${capitalizedName}> {
    // TODO: Implement database creation
    logger.info(\`Creating ${featureName}: \${data.name}\`);
    
    // Placeholder implementation
    const ${featureName}: ${capitalizedName} = {
      id: \`${featureName}_\${Date.now()}\`,
      name: data.name,
      description: data.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return ${featureName};
  }

  static async get${capitalizedName}s(): Promise<${capitalizedName}[]> {
    // TODO: Implement database query
    logger.info("Fetching all ${featureName}s");
    
    // Placeholder implementation
    return [];
  }

  static async get${capitalizedName}ById(id: string): Promise<${capitalizedName} | null> {
    // TODO: Implement database query
    logger.info(\`Fetching ${featureName} with ID: \${id}\`);
    
    // Placeholder implementation
    return null;
  }

  static async update${capitalizedName}(data: Update${capitalizedName}Input): Promise<${capitalizedName} | null> {
    // TODO: Implement database update
    logger.info(\`Updating ${featureName} with ID: \${data.id}\`);
    
    // Placeholder implementation
    return null;
  }

  static async delete${capitalizedName}(id: string): Promise<boolean> {
    // TODO: Implement database deletion
    logger.info(\`Deleting ${featureName} with ID: \${id}\`);
    
    // Placeholder implementation
    return true;
  }
}

// ===== ${capitalizedName.toUpperCase()} API ROUTER =====
export const ${featureName}Router = router({
  // Create a new ${featureName}
  create: loggedProcedure
    .input(Create${capitalizedName}InputSchema)
    .mutation(async ({ input }) => {
      return ${capitalizedName}Service.create${capitalizedName}(input);
    }),

  // Get all ${featureName}s
  list: loggedProcedure
    .query(async () => {
      return ${capitalizedName}Service.get${capitalizedName}s();
    }),

  // Get a single ${featureName} by ID
  getById: loggedProcedure
    .input(${capitalizedName}IdSchema)
    .query(async ({ input }) => {
      const ${featureName} = await ${capitalizedName}Service.get${capitalizedName}ById(input.id);
      if (!${featureName}) {
        throw new Error("${capitalizedName} not found");
      }
      return ${featureName};
    }),

  // Update a ${featureName}
  update: loggedProcedure
    .input(Update${capitalizedName}InputSchema)
    .mutation(async ({ input }) => {
      const ${featureName} = await ${capitalizedName}Service.update${capitalizedName}(input);
      if (!${featureName}) {
        throw new Error("${capitalizedName} not found or update failed");
      }
      return ${featureName};
    }),

  // Delete a ${featureName}
  delete: loggedProcedure
    .input(${capitalizedName}IdSchema)
    .mutation(async ({ input }) => {
      const success = await ${capitalizedName}Service.delete${capitalizedName}(input.id);
      return { success, id: input.id };
    }),
});
`;

    // 3. Create frontend.tsx - Complete client logic
    const frontendContent = `/**
 * 🌐 ${capitalizedName.toUpperCase()} FRONTEND
 * All client-side code for ${featureName} feature
 * - React components (${capitalizedName}List, ${capitalizedName}Form, etc.)
 * - Custom hooks (use${capitalizedName}s, useCreate${capitalizedName}, etc.)
 * - State management
 */

import React, { useState, memo } from "react";
import { trpc } from "@/frontend/utils";
import type {
  ${capitalizedName},
  Create${capitalizedName}Input,
  Update${capitalizedName}Input,
} from "./types";

// ===== HOOKS =====
export function use${capitalizedName}s() {
  return trpc.${featureName}.list.useQuery();
}

export function use${capitalizedName}ById(id: string) {
  return trpc.${featureName}.getById.useQuery({ id });
}

export function useCreate${capitalizedName}() {
  const utils = trpc.useUtils();
  return trpc.${featureName}.create.useMutation({
    onSuccess: () => {
      utils.${featureName}.list.invalidate();
    },
  });
}

export function useUpdate${capitalizedName}() {
  const utils = trpc.useUtils();
  return trpc.${featureName}.update.useMutation({
    onSuccess: () => {
      utils.${featureName}.list.invalidate();
    },
  });
}

export function useDelete${capitalizedName}() {
  const utils = trpc.useUtils();
  return trpc.${featureName}.delete.useMutation({
    onSuccess: () => {
      utils.${featureName}.list.invalidate();
    },
  });
}

// ===== COMPONENTS =====

// ${capitalizedName}Form Component
interface ${capitalizedName}FormProps {
  ${featureName}?: ${capitalizedName};
  onSuccess: () => void;
  onCancel: () => void;
}

export const ${capitalizedName}Form: React.FC<${capitalizedName}FormProps> = ({ ${featureName}, onSuccess, onCancel }) => {
  const isEditing = !!${featureName};
  const create${capitalizedName} = useCreate${capitalizedName}();
  const update${capitalizedName} = useUpdate${capitalizedName}();

  const [formData, setFormData] = useState({
    name: ${featureName}?.name || "",
    description: ${featureName}?.description || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEditing) {
      const updateData: Update${capitalizedName}Input = {
        id: ${featureName}.id,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      };

      update${capitalizedName}.mutate(updateData, {
        onSuccess: () => onSuccess(),
        onError: (error) => setErrors({ general: error.message }),
      });
    } else {
      const createData: Create${capitalizedName}Input = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      };

      create${capitalizedName}.mutate(createData, {
        onSuccess: () => onSuccess(),
        onError: (error) => setErrors({ general: error.message }),
      });
    }
  };

  const isLoading = create${capitalizedName}.isPending || update${capitalizedName}.isPending;

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h3>{isEditing ? \`Edit \${${featureName}.name}\` : "Create New ${capitalizedName}"}</h3>
      
      {errors.general && (
        <div style={{ color: 'red', padding: '8px', border: '1px solid red', borderRadius: '4px', marginBottom: '16px' }}>
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label>Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter ${featureName} name"
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
          {errors.name && <span style={{ color: 'red', fontSize: '12px' }}>{errors.name}</span>}
        </div>

        <div>
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter ${featureName} description"
            rows={3}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel} style={{ padding: '8px 16px' }}>
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isLoading} 
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px' 
            }}
          >
            {isLoading ? "Saving..." : isEditing ? \`Update \${${featureName}.name}\` : "Create ${capitalizedName}"}
          </button>
        </div>
      </form>
    </div>
  );
};

// ${capitalizedName}Card Component
interface ${capitalizedName}CardProps {
  ${featureName}: ${capitalizedName};
  onEdit: (${featureName}: ${capitalizedName}) => void;
}

export const ${capitalizedName}Card: React.FC<${capitalizedName}CardProps> = ({ ${featureName}, onEdit }) => {
  const delete${capitalizedName} = useDelete${capitalizedName}();

  const handleDelete = () => {
    if (confirm(\`Are you sure you want to delete "\${${featureName}.name}"?\`)) {
      delete${capitalizedName}.mutate({ id: ${featureName}.id });
    }
  };

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      margin: '8px 0',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{${featureName}.name}</h3>
          {${featureName}.description && (
            <p style={{ margin: '0 0 8px 0', color: '#666' }}>{${featureName}.description}</p>
          )}
          <div style={{ fontSize: '12px', color: '#999' }}>
            Created: {new Date(${featureName}.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => onEdit(${featureName})} 
            style={{ padding: '4px 8px', fontSize: '12px' }}
          >
            Edit
          </button>
          <button 
            onClick={handleDelete} 
            style={{ 
              padding: '4px 8px', 
              fontSize: '12px', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px' 
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ${capitalizedName}List Component - Main component
export const ${capitalizedName}List: React.FC = memo(() => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editing${capitalizedName}, setEditing${capitalizedName}] = useState<${capitalizedName} | null>(null);

  const { data: ${featureName}s, isLoading } = use${capitalizedName}s();

  const handleCreate = () => {
    setShowCreateForm(false);
  };

  const handleUpdate = () => {
    setEditing${capitalizedName}(null);
  };

  const handleEdit = (${featureName}: ${capitalizedName}) => {
    setEditing${capitalizedName}(${featureName});
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>${capitalizedName} Manager</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: '12px 24px',
            backgroundColor: showCreateForm ? '#dc3545' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          {showCreateForm ? "✕ Cancel" : "+ Add ${capitalizedName}"}
        </button>
      </div>

      {showCreateForm && (
        <div style={{ marginBottom: '24px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white' }}>
          <${capitalizedName}Form
            onSuccess={handleCreate}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {editing${capitalizedName} && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', padding: '20px', borderRadius: '8px', 
            maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto'
          }}>
            <${capitalizedName}Form
              ${featureName}={editing${capitalizedName}}
              onSuccess={handleUpdate}
              onCancel={() => setEditing${capitalizedName}(null)}
            />
          </div>
        </div>
      )}

      <div>
        {isLoading ? (
          <div>⏳ Loading ${featureName}s...</div>
        ) : !${featureName}s?.length ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3>No ${featureName}s yet</h3>
            <p>Create your first ${featureName} to get started!</p>
          </div>
        ) : (
          ${featureName}s.map((${featureName}) => (
            <${capitalizedName}Card key={${featureName}.id} ${featureName}={${featureName}} onEdit={handleEdit} />
          ))
        )}
      </div>
    </div>
  );
});

${capitalizedName}List.displayName = "${capitalizedName}List";

// ===== EXPORTS =====
export {
  use${capitalizedName}s,
  use${capitalizedName}ById,
  useCreate${capitalizedName},
  useUpdate${capitalizedName},
  useDelete${capitalizedName},
  ${capitalizedName}Form,
  ${capitalizedName}Card,
  ${capitalizedName}List,
};

// Default export for the main component
export default ${capitalizedName}List;
`;

    // 4. Create routes.tsx - Route configuration
    const routesContent = `/**
 * 🛣️ ${capitalizedName.toUpperCase()} ROUTES
 * Route configuration for ${featureName} feature
 */

import { lazy } from 'react';

// Lazy load the ${capitalizedName}List for better performance
const Lazy${capitalizedName}List = lazy(() => 
  import('./frontend').then(module => ({ default: module.${capitalizedName}List }))
);

export const ${featureName}Routes = [
  {
    path: "${featureName}s",
    element: <Lazy${capitalizedName}List />,
  },
  // Future ${featureName}-related routes can be added here
  // {
  //   path: "${featureName}s/:id",
  //   element: <${capitalizedName}Detail />,
  // },
];
`;

    // 5. Create index.ts - Clean exports
    const indexContent = `/**
 * 🎯 ${capitalizedName.toUpperCase()} FEATURE
 * Complete ${featureName} functionality
 * 
 * BACKEND: ${capitalizedName}Service, ${featureName}Router
 * FRONTEND: ${capitalizedName}List, ${capitalizedName}Form, use${capitalizedName}s
 * TYPES: ${capitalizedName}, Create${capitalizedName}Input, etc.
 */

// Backend exports
export * from './backend';

// Frontend exports  
export * from './frontend';

// Types exports
export * from './types';

// Routes exports
export * from './routes';
`;

    // Write all files
    await writeFile(join(featuresDir, "types.ts"), typesContent);
    await writeFile(join(featuresDir, "backend.ts"), backendContent);
    await writeFile(join(featuresDir, "frontend.tsx"), frontendContent);
    await writeFile(join(featuresDir, "routes.tsx"), routesContent);
    await writeFile(join(featuresDir, "index.ts"), indexContent);

    console.log(`✅ LLM-Optimized feature "${featureName}" created successfully!`);
    console.log(`📁 Location: ${featuresDir}`);
    console.log(``);
    console.log(`🎯 Created files:`);
    console.log(`   📄 types.ts      - All schemas & types (150 lines)`);
    console.log(`   📄 backend.ts    - All server logic (200 lines)`);
    console.log(`   📄 frontend.tsx  - All client logic (300 lines)`);
    console.log(`   📄 routes.tsx    - Route configuration`);
    console.log(`   📄 index.ts      - Clean exports`);
    console.log(``);
    console.log(`🚀 Next steps:`);
    console.log(`1. Add ${featureName}Router to src/backend/router.ts:`);
    console.log(`   import { ${featureName}Router } from "@/features/${featureName}/backend";`);
    console.log(`   // Add to appRouter: ${featureName}: ${featureName}Router,`);
    console.log(``);
    console.log(`2. Add database schema to src/backend/schemas.ts`);
    console.log(`3. Implement the service methods in backend.ts`);
    console.log(`4. Add routes to your main router configuration`);
    console.log(``);
    console.log(`🎸 Ready for LLM-powered vibecoding!`);

  } catch (error) {
    console.error(`❌ Error creating feature "${featureName}":`, error);
    process.exit(1);
  }
}

createLLMOptimizedFeature();
