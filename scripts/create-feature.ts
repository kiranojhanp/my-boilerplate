#!/usr/bin/env bun

/**
 * Feature Generator Script
 * Creates a new feature with the standardized structure
 */

import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const featureName = process.argv[2];

if (!featureName) {
  console.error(
    "Please provide a feature name: bun run scripts/create-feature.ts <featureName>"
  );
  process.exit(1);
}

const capitalizedName =
  featureName.charAt(0).toUpperCase() + featureName.slice(1);
const featuresDir = join(process.cwd(), "src", "features", featureName);

async function createFeature() {
  try {
    // Create directories
    await mkdir(join(featuresDir, "server"), { recursive: true });
    await mkdir(join(featuresDir, "web", "components"), { recursive: true });
    await mkdir(join(featuresDir, "web", "hooks"), { recursive: true });
    await mkdir(join(featuresDir, "web", "styles"), { recursive: true });

    // Create types.ts
    const typesContent = `import { z } from "zod";

// ${capitalizedName} schemas
export const ${capitalizedName}Schema = z.object({
  id: z.string().min(1, "Invalid ${featureName} ID"),
  name: z.string().min(1).max(200),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Input schemas
export const Create${capitalizedName}InputSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
});

export const Update${capitalizedName}InputSchema = z.object({
  id: z.string().min(1, "${capitalizedName} ID is required"),
  name: z.string().min(1).max(200).optional(),
});

export const ${capitalizedName}IdSchema = z.object({
  id: z.string().min(1, "${capitalizedName} ID is required"),
});

// Type exports
export type ${capitalizedName} = z.infer<typeof ${capitalizedName}Schema>;
export type Create${capitalizedName}Input = z.infer<typeof Create${capitalizedName}InputSchema>;
export type Update${capitalizedName}Input = z.infer<typeof Update${capitalizedName}InputSchema>;
export type ${capitalizedName}Id = z.infer<typeof ${capitalizedName}IdSchema>;
`;

    // Create server/service.ts
    const serviceContent = `import { db } from "@/server/shared/db";
import type {
  Create${capitalizedName}Input,
  Update${capitalizedName}Input,
  ${capitalizedName},
} from "@/features/${featureName}/types";
import { logger } from "@/server/shared/utils/logger";

export class ${capitalizedName}Service {
  static async create${capitalizedName}(data: Create${capitalizedName}Input): Promise<${capitalizedName}> {
    // TODO: Implement create logic
    logger.info(\`Creating ${featureName} with name: \${data.name}\`);
    throw new Error("Not implemented");
  }

  static async get${capitalizedName}ById(id: string): Promise<${capitalizedName} | null> {
    // TODO: Implement get by id logic
    throw new Error("Not implemented");
  }

  static async update${capitalizedName}(data: Update${capitalizedName}Input): Promise<${capitalizedName} | null> {
    // TODO: Implement update logic
    logger.info(\`Updating ${featureName} with ID: \${data.id}\`);
    throw new Error("Not implemented");
  }

  static async delete${capitalizedName}(id: string): Promise<boolean> {
    // TODO: Implement delete logic
    logger.info(\`Deleting ${featureName} with ID: \${id}\`);
    throw new Error("Not implemented");
  }
}
`;

    // Create server/router.ts
    const routerContent = `import { router, loggedProcedure } from "@/server/shared/trpc/trpc";
import {
  Create${capitalizedName}InputSchema,
  Update${capitalizedName}InputSchema,
  ${capitalizedName}IdSchema,
} from "@/features/${featureName}/types";
import { ${capitalizedName}Service } from "./service";

export const ${featureName}Router = router({
  // Create a new ${featureName}
  create: loggedProcedure
    .input(Create${capitalizedName}InputSchema)
    .mutation(async ({ input }) => {
      return ${capitalizedName}Service.create${capitalizedName}(input);
    }),

  // Get a ${featureName} by ID
  getById: loggedProcedure.input(${capitalizedName}IdSchema).query(async ({ input }) => {
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
  delete: loggedProcedure.input(${capitalizedName}IdSchema).mutation(async ({ input }) => {
    const success = await ${capitalizedName}Service.delete${capitalizedName}(input.id);
    return { success, id: input.id };
  }),
});
`;

    // Create server/index.ts
    const serverIndexContent = `export { ${featureName}Router } from "./router";
export { ${capitalizedName}Service } from "./service";
`;

    // Create web/hooks/use${capitalizedName}s.ts
    const hooksContent = `import { trpc } from "@/web/shared/lib/trpc";
import type {
  Create${capitalizedName}Input,
  Update${capitalizedName}Input,
} from "@/features/${featureName}/types";

export function use${capitalizedName}ById(id: string) {
  return trpc.${featureName}.getById.useQuery({ id });
}

export function useCreate${capitalizedName}() {
  const utils = trpc.useContext();
  
  return trpc.${featureName}.create.useMutation({
    onSuccess: () => {
      // Invalidate relevant queries on success
      utils.${featureName}.invalidate();
    },
  });
}

export function useUpdate${capitalizedName}() {
  const utils = trpc.useContext();
  
  return trpc.${featureName}.update.useMutation({
    onSuccess: () => {
      utils.${featureName}.invalidate();
    },
  });
}

export function useDelete${capitalizedName}() {
  const utils = trpc.useContext();
  
  return trpc.${featureName}.delete.useMutation({
    onSuccess: () => {
      utils.${featureName}.invalidate();
    },
  });
}
`;

    // Create web/components/${capitalizedName}Form/index.tsx
    await mkdir(
      join(featuresDir, "web", "components", `${capitalizedName}Form`),
      { recursive: true }
    );
    const formComponentContent = `import React, { useState } from "react";
import { Button } from "@/web/shared/components/Button";
import { Input } from "@/web/shared/components/Input";
import { useCreate${capitalizedName}, useUpdate${capitalizedName} } from "../hooks/use${capitalizedName}s";
import type { ${capitalizedName} } from "@/features/${featureName}/types";
import styles from "./styles.module.css";

interface ${capitalizedName}FormProps {
  ${featureName}?: ${capitalizedName};
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ${capitalizedName}Form({ ${featureName}, onSuccess, onCancel }: ${capitalizedName}FormProps) {
  const [name, setName] = useState(${featureName}?.name || "");

  const create${capitalizedName} = useCreate${capitalizedName}();
  const update${capitalizedName} = useUpdate${capitalizedName}();

  const isEditing = !!${featureName};
  const mutation = isEditing ? update${capitalizedName} : create${capitalizedName};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        await update${capitalizedName}.mutateAsync({
          id: ${featureName}.id,
          name,
        });
      } else {
        await create${capitalizedName}.mutateAsync({
          name,
        });
      }
      
      onSuccess?.();
      if (!isEditing) setName("");
    } catch (error) {
      console.error("Error saving ${featureName}:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <Input
          type="text"
          placeholder="Enter ${featureName} name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div className={styles.actions}>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending 
            ? (isEditing ? "Updating..." : "Creating...") 
            : (isEditing ? "Update" : "Create")
          }
        </Button>
        
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
`;

    // Create web/components/${capitalizedName}Form/styles.module.css
    const formStylesContent = `.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
`;

    // Create web/routes.tsx
    const routesContent = `import React, { lazy, Suspense } from "react";
import type { RouteConfig, RouteMetadata } from "@/web/shared/types/routes";
import { LoadingSpinner } from "@/web/shared/components/LoadingSpinner";

// Lazy load components for code splitting
const ${capitalizedName}Dashboard = lazy(() =>
  import("./components/${capitalizedName}Dashboard").then((m) => ({
    default: m.${capitalizedName}Dashboard,
  }))
);

// Wrapper component for Suspense
const Lazy${capitalizedName}Dashboard = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <${capitalizedName}Dashboard />
  </Suspense>
);

// Route metadata for navigation
export const ${featureName}RouteMetadata: RouteMetadata[] = [
  {
    title: "${capitalizedName} Dashboard",
    path: "/${featureName}",
    showInNav: true,
    description: "Main ${featureName} dashboard",
  },
];

// Route configuration
export const ${featureName}Routes: RouteConfig[] = [
  {
    path: "/${featureName}",
    element: <Lazy${capitalizedName}Dashboard />,
    handle: {
      crumb: () => "${capitalizedName}",
    },
  },
];
`;

    // Create web/index.ts
    const webIndexContent = `export { ${capitalizedName}Form } from "./components/${capitalizedName}Form";

export {
  use${capitalizedName}ById,
  useCreate${capitalizedName},
  useUpdate${capitalizedName},
  useDelete${capitalizedName},
} from "./hooks/use${capitalizedName}s";

export { ${featureName}Routes } from "./routes";
`;

    // Create main index.ts
    const mainIndexContent = `// Feature exports - provides a clean API for the entire ${featureName} feature
export * from "./types";

// Server exports (for server-side usage)
export * from "./server";

// Web exports (for client-side usage) 
export * from "./web";
`;

    // Write all files
    await writeFile(join(featuresDir, "types.ts"), typesContent);
    await writeFile(join(featuresDir, "server", "service.ts"), serviceContent);
    await writeFile(join(featuresDir, "server", "router.ts"), routerContent);
    await writeFile(
      join(featuresDir, "server", "index.ts"),
      serverIndexContent
    );
    await writeFile(
      join(featuresDir, "web", "hooks", `use${capitalizedName}s.ts`),
      hooksContent
    );
    await writeFile(
      join(
        featuresDir,
        "web",
        "components",
        `${capitalizedName}Form`,
        "index.tsx"
      ),
      formComponentContent
    );
    await writeFile(
      join(
        featuresDir,
        "web",
        "components",
        `${capitalizedName}Form`,
        "styles.module.css"
      ),
      formStylesContent
    );
    await writeFile(join(featuresDir, "web", "routes.tsx"), routesContent);
    await writeFile(join(featuresDir, "web", "index.ts"), webIndexContent);
    await writeFile(join(featuresDir, "index.ts"), mainIndexContent);

    console.log(`✅ Feature "${featureName}" created successfully!`);
    console.log(`📁 Location: ${featuresDir}`);
    console.log(``);
    console.log(`Next steps:`);
    console.log(`1. Add the ${featureName}Router to your main tRPC router`);
    console.log(`2. Implement the database schema and service methods`);
    console.log(`3. Create additional components as needed`);
    console.log(`4. Add routes to your router configuration`);
  } catch (error) {
    console.error(`❌ Error creating feature "${featureName}":`, error);
    process.exit(1);
  }
}

createFeature();
