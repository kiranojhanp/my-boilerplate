import fs from "fs";
import path from "path";
import pluralize from "pluralize";

const featureName = process.argv[2];

if (!featureName) {
  console.error("Please provide a feature name.");
  process.exit(1);
}

const featurePlural = pluralize(featureName);

const featureDir = path.join("src", "features", featureName);

if (fs.existsSync(featureDir)) {
  console.error(`Feature "${featureName}" already exists.`);
  process.exit(1);
}

fs.mkdirSync(featureDir, { recursive: true });

const files = [
  {
    name: "index.ts",
    content: `/**
 * 🎯 ${featureName.toUpperCase()} FEATURE
 * Complete ${featureName} functionality
 * 
 * BACKEND: ${capitalize(featureName)}Service, ${featureName}Router
 * FRONTEND: ${capitalize(featureName)}Dashboard, ${capitalize(featureName)}Form, ${capitalize(featureName)}Card, use${capitalize(featureName)}s, useCreate${capitalize(featureName)}
 * TYPES: ${capitalize(featureName)}, Create${capitalize(featureName)}Input, etc.
 * 
 * 🔗 INTEGRATION REQUIRED:
 * 1. Add ${featureName}Router to src/backend/router.ts
 * 2. Add ${featureName}Routes to src/frontend/router.tsx  
 * 3. Update database schemas if needed
 */

// Backend exports
export * from './backend'

// Frontend exports  
export * from './frontend'

// Types exports
export * from './types'

// Routes exports (if needed)
// export * from './routes'
`,
  },
  {
    name: "types.ts",
    content: `/**
 * 🏷️ ${featureName.toUpperCase()} TYPES
 * All TypeScript types and Zod schemas for ${featureName} feature
 * Shared between backend and frontend
 */

import { z } from "zod";

// ===== BASE SCHEMAS =====
export const ${capitalize(featureName)}Schema = z.object({
  id: z.number(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ===== INPUT SCHEMAS =====
export const Create${capitalize(featureName)}InputSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const Update${capitalize(featureName)}InputSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required").optional(),
});

// ===== TYPES =====
export type ${capitalize(featureName)} = z.infer<typeof ${capitalize(featureName)}Schema>;
export type Create${capitalize(featureName)}Input = z.infer<typeof Create${capitalize(featureName)}InputSchema>;
export type Update${capitalize(featureName)}Input = z.infer<typeof Update${capitalize(featureName)}InputSchema>;
`,
  },
  {
    name: "backend.ts",
    content: `/**
 * 🖥️ ${featureName.toUpperCase()} BACKEND
 * All server-side logic for ${featureName} feature
 * - Database operations (${capitalize(featureName)}Service)
 * - Business logic
 * - tRPC routes (${featureName}Router)
 * 
 * 🔗 INTEGRATION: Add to src/backend/router.ts:
 * import { ${featureName}Router } from '@/features/${featureName}/backend';
 * 
 * export const appRouter = router({
 *   // ...existing routes...
 *   ${featureName}: ${featureName}Router,
 * });
 */

import { router, loggedProcedure } from "@/backend/trpc";
import { logger } from "@/backend/utils";
import { z } from "zod";
import {
  Create${capitalize(featureName)}InputSchema,
  Update${capitalize(featureName)}InputSchema,
} from "./types";
import type {
  ${capitalize(featureName)},
  Create${capitalize(featureName)}Input,
  Update${capitalize(featureName)}Input,
} from "./types";

// ===== ${featureName.toUpperCase()} SERVICE =====
export class ${capitalize(featureName)}Service {
  static async getAll(): Promise<${capitalize(featureName)}[]> {
    logger.info(\`Getting all ${featureName}s\`);
    // TODO: Implement database query
    return [
      {
        id: 1,
        name: \`Sample ${capitalize(featureName)}\`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
  }

  static async getById(id: number): Promise<${capitalize(featureName)} | null> {
    logger.info(\`Getting ${featureName} by id: \${id}\`);
    // TODO: Implement database query
    return {
      id,
      name: \`Sample ${capitalize(featureName)} \${id}\`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static async create(input: Create${capitalize(featureName)}Input): Promise<${capitalize(featureName)}> {
    logger.info(\`Creating ${featureName}: \${input.name}\`);
    // TODO: Implement database insert
    return {
      id: Date.now(),
      name: input.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static async update(input: Update${capitalize(featureName)}Input): Promise<${capitalize(featureName)}> {
    logger.info(\`Updating ${featureName}: \${input.id}\`);
    // TODO: Implement database update
    const existing = await this.getById(input.id);
    if (!existing) {
      throw new Error(\`${capitalize(featureName)} not found\`);
    }
    return {
      ...existing,
      ...input,
      updatedAt: new Date(),
    };
  }

  static async delete(id: number): Promise<void> {
    logger.info(\`Deleting ${featureName}: \${id}\`);
    // TODO: Implement database delete
  }
}

// ===== ${featureName.toUpperCase()} ROUTER =====
export const ${featureName}Router = router({
  list: loggedProcedure.query(async () => {
    return await ${capitalize(featureName)}Service.getAll();
  }),

  getById: loggedProcedure
    .input(z.number())
    .query(async ({ input: id }) => {
      return await ${capitalize(featureName)}Service.getById(id);
    }),

  create: loggedProcedure
    .input(Create${capitalize(featureName)}InputSchema)
    .mutation(async ({ input }) => {
      return await ${capitalize(featureName)}Service.create(input);
    }),

  update: loggedProcedure
    .input(Update${capitalize(featureName)}InputSchema)
    .mutation(async ({ input }) => {
      return await ${capitalize(featureName)}Service.update(input);
    }),

  delete: loggedProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      await ${capitalize(featureName)}Service.delete(id);
      return { success: true };
    }),
});
`,
  },
  {
    name: "frontend.tsx",
    content: `/**
 * 🌐 ${featureName.toUpperCase()} FRONTEND
 * All client-side code for ${featureName} feature
 * - React components (${capitalize(featureName)}Dashboard, ${capitalize(featureName)}Form, ${capitalize(featureName)}Card, etc.)
 * - Custom hooks (use${capitalize(featureName)}s, useCreate${capitalize(featureName)}, etc.)
 * - State management
 */

import React, { useState } from "react";
import { trpc } from "@/frontend/utils";
import type {
  ${capitalize(featureName)},
  Create${capitalize(featureName)}Input,
  Update${capitalize(featureName)}Input,
} from "./types";

// ===== HOOKS =====
export const use${capitalize(featureName)}s = () => {
  return trpc.${featureName}.list.useQuery();
};

export const useCreate${capitalize(featureName)} = () => {
  return trpc.${featureName}.create.useMutation();
};

export const useUpdate${capitalize(featureName)} = () => {
  return trpc.${featureName}.update.useMutation();
};

export const useDelete${capitalize(featureName)} = () => {
  return trpc.${featureName}.delete.useMutation();
};

// ===== COMPONENTS =====
export const ${capitalize(featureName)}Form: React.FC<{
  onSubmit: (data: Create${capitalize(featureName)}Input) => void;
  isLoading?: boolean;
}> = ({ onSubmit, isLoading = false }) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({ name: name.trim() });
      setName("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="Enter ${featureName} name"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !name.trim()}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isLoading ? "Creating..." : "Create ${capitalize(featureName)}"}
      </button>
    </form>
  );
};

export const ${capitalize(featureName)}Card: React.FC<{
  ${featureName}: ${capitalize(featureName)};
  onEdit?: (${featureName}: ${capitalize(featureName)}) => void;
  onDelete?: (id: number) => void;
}> = ({ ${featureName}, onEdit, onDelete }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{${featureName}.name}</h3>
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(${featureName})}
              className="text-blue-600 hover:text-blue-900"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(${featureName}.id)}
              className="text-red-600 hover:text-red-900"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Created: {new Date(${featureName}.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
};

export const ${capitalize(featureName)}Dashboard: React.FC = () => {
  const { data: ${featureName}s, isLoading, error, refetch } = use${capitalize(featureName)}s();
  const createMutation = useCreate${capitalize(featureName)}();
  const deleteMutation = useDelete${capitalize(featureName)}();

  const handleCreate = async (input: Create${capitalize(featureName)}Input) => {
    try {
      await createMutation.mutateAsync(input);
      refetch();
    } catch (error) {
      console.error("Failed to create ${featureName}:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this ${featureName}?")) {
      try {
        await deleteMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error("Failed to delete ${featureName}:", error);
      }
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading ${featureName}s...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error loading ${featureName}s: {error.message}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">${capitalize(featurePlural)}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Create New ${capitalize(featureName)}</h2>
            <${capitalize(featureName)}Form
              onSubmit={handleCreate}
              isLoading={createMutation.isPending}
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="space-y-4">
            {${featureName}s?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No ${featurePlural} found. Create your first one!
              </div>
            ) : (
              ${featureName}s?.map((${featureName}) => (
                <${capitalize(featureName)}Card
                  key={${featureName}.id}
                  ${featureName}={${featureName}}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
`,
  },
  {
    name: "routes.tsx",
    content: `/**
 * 🛣️ ${featureName.toUpperCase()} ROUTES
 * Route configuration for ${featureName} feature
 * 
 * 🔗 INTEGRATION: Add to src/frontend/router.tsx:
 * import { ${featureName}Routes } from '@/features/${featureName}/routes';
 * 
 * const routes = [
 *   // ...existing routes...
 *   ...${featureName}Routes,
 * ];
 */

import { lazy } from 'react';

// Lazy load the ${capitalize(featureName)}Dashboard for better performance
const Lazy${capitalize(featureName)}Dashboard = lazy(() => 
  import('./frontend').then(module => ({ default: module.${capitalize(featureName)}Dashboard }))
);

export const ${featureName}Routes = [
  {
    path: "${featurePlural}",
    element: <Lazy${capitalize(featureName)}Dashboard />,
  },
  // Future ${featureName}-related routes can be added here
  // {
  //   path: "${featurePlural}/:id",
  //   element: <${capitalize(featureName)}Detail />,
  // },
];
`,
  },
];

files.forEach((file) => {
  fs.writeFileSync(path.join(featureDir, file.name), file.content);
});

// Automatically integrate the feature
try {
  await integrateFeature(featureName);
  console.log(`✅ Feature "${featureName}" created and integrated successfully!`);
} catch (error) {
  console.log(`✅ Feature "${featureName}" created successfully!`);
  console.error(`❌ Auto-integration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  console.log(`\n📋 MANUAL INTEGRATION REQUIRED:`);
}

console.log(`\n🧪 TESTING:`);
console.log(`   - Visit /${featurePlural} to see your new feature`);
console.log(`   - Test CRUD operations in the dashboard`);
console.log(`\n🚀 Happy coding!`);

async function integrateFeature(featureName: string) {
  // 1. Integrate backend router
  await integrateBackendRouter(featureName);
  
  // 2. Integrate frontend routes
  await integrateFrontendRoutes(featureName);
  
  console.log(`\n🔗 Auto-integration completed:`);
  console.log(`   ✅ Backend router updated`);
  console.log(`   ✅ Frontend routes updated`);
  console.log(`   ✅ Navigation link added`);
}

async function integrateBackendRouter(featureName: string) {
  const routerPath = path.join('src', 'backend', 'router.ts');
  let content = fs.readFileSync(routerPath, 'utf-8');
  
  // Add import
  const importLine = `import { ${featureName}Router } from "@/features/${featureName}/backend";`;
  if (!content.includes(importLine)) {
    const importInsertPoint = content.indexOf('import { todoRouter }');
    if (importInsertPoint !== -1) {
      const lines = content.split('\n');
      const importLineIndex = lines.findIndex(line => line.includes('import { todoRouter }'));
      lines.splice(importLineIndex + 1, 0, importLine);
      content = lines.join('\n');
    }
  }
  
  // Add to router
  const routerEntry = `  ${featureName}: ${featureName}Router,`;
  if (!content.includes(routerEntry)) {
    const routerInsertPoint = content.indexOf('  todo: todoRouter,');
    if (routerInsertPoint !== -1) {
      const lines = content.split('\n');
      const routerLineIndex = lines.findIndex(line => line.includes('  todo: todoRouter,'));
      lines.splice(routerLineIndex + 1, 0, routerEntry);
      content = lines.join('\n');
    }
  }
  
  fs.writeFileSync(routerPath, content);
}

async function integrateFrontendRoutes(featureName: string) {
  const routerPath = path.join('src', 'frontend', 'router.tsx');
  let content = fs.readFileSync(routerPath, 'utf-8');
  
  // Add import
  const importLine = `import { ${featureName}Routes } from "@/features/${featureName}/routes";`;
  if (!content.includes(importLine)) {
    const importInsertPoint = content.indexOf('import { todoRoutes }');
    if (importInsertPoint !== -1) {
      const lines = content.split('\n');
      const importLineIndex = lines.findIndex(line => line.includes('import { todoRoutes }'));
      lines.splice(importLineIndex + 1, 0, importLine);
      content = lines.join('\n');
    }
  }
  
  // Add to routes
  const routeEntry = `        ...${featureName}Routes,`;
  if (!content.includes(routeEntry)) {
    const routeInsertPoint = content.indexOf('        ...todoRoutes,');
    if (routeInsertPoint !== -1) {
      const lines = content.split('\n');
      const routeLineIndex = lines.findIndex(line => line.includes('        ...todoRoutes,'));
      lines.splice(routeLineIndex + 1, 0, routeEntry);
      content = lines.join('\n');
    }
  }
  
  // Add navigation link
  const navLink = `        <NavLink
          to="/${featurePlural}"
          style={({ isActive }) => ({
            marginRight: "1rem",
            textDecoration: "none",
            color: isActive ? "#0056b3" : "#007bff",
            fontWeight: isActive ? "bold" : "normal",
          })}
        >
          ${capitalize(featurePlural)}
        </NavLink>`;
  
  if (!content.includes(`to="/${featurePlural}"`)) {
    const navInsertPoint = content.indexOf('        </NavLink>\n      </nav>');
    if (navInsertPoint !== -1) {
      const insertIndex = navInsertPoint;
      content = content.slice(0, insertIndex) + navLink + '\n        ' + content.slice(insertIndex);
    }
  }
  
  fs.writeFileSync(routerPath, content);
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
