import * as zod from "https://deno.land/x/zod@v3.19.1/mod.ts";

export const pageOne = zod.object({
    upc: zod.string().min(1).transform(x => x.trim() || undefined).or(zod.any().transform(_ => undefined))
});

export const pageTwo = zod.object({
    title: zod.string().min(1).refine(x => x.trim()),
    artists: zod.tuple([ zod.string(), zod.string(), zod.string() ]).array(),
    release: zod.string(),
    language: zod.string(),
    primaryGenre: zod.string(),
    secondaryGenre: zod.string()
});

export const pageThree = zod.object({
    compositionCopyright: zod.string().min(1).refine(x => x.trim()),
    soundRecordingCopyright: zod.string().min(1).refine(x => x.trim())
});

export const pageFour = zod.object({
    loading: zod.literal(false, { description: "Upload still in progress" }),
    artwork: zod.string()
}).strip();

export const pageFive = zod.object({
    uploadingSongs: zod.array(zod.string()).max(0, { message: "Some uploads are still in progress" }),
    songs: zod.array(zod.object({
        title: zod.string(),
        file: zod.string({ required_error: "a Song is missing its file." })
    })).min(1)
});

export const drop = pageOne
    .merge(pageTwo)
    .merge(pageThree)
    .merge(pageFour)
    .merge(pageFive);