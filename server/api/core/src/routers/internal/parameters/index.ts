import { publicProcedure } from '../../../procedure';
import { createTRPCRouter } from '../../../trpc';
import { z } from 'zod';

export const parametersRouter = createTRPCRouter({
  // Fetch all module parameters
  fetchAllModuleParams: publicProcedure.query(async ({ ctx }) => {
    const allModuleParams = await ctx.db.module_params.findMany({
      select: {
        module_name: true,
        params: true,
      },
    });
    
    // Convert to a map for easier access
    const paramsMap = allModuleParams.reduce((acc, param) => {
      acc[param.module_name] = param.params;
      return acc;
    }, {} as Record<string, any>);
    
    return paramsMap;
  }),
  
  // Fetch a specific module's parameters
  fetchModuleParams: publicProcedure
    .input(z.object({ module_name: z.string() }))
    .query(async ({ ctx, input }) => {
      const moduleParams = await ctx.db.module_params.findUnique({
        where: {
          module_name: input.module_name,
        },
        select: {
          params: true,
        },
      });
      
      return moduleParams?.params;
    }),
}); 