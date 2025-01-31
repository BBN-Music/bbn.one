import { extendZodWithOpenApi } from "https://esm.sh/zod-openapi@4.2.3";
import { z } from "https://esm.sh/zod@3.24.1";
extendZodWithOpenApi(z);

export { z };
