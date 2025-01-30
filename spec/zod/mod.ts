import { extendZodWithOpenApi } from "https://esm.sh/zod-openapi@4.0.0";
import { z } from "https://esm.sh/zod@3.24.1";
extendZodWithOpenApi(z);

export { z };
