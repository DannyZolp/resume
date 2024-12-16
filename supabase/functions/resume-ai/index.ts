import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import OpenAI from "jsr:@openai/openai";

const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY") ?? "",
});

Deno.serve(async (req: Request) => {
    // This is needed if you're planning to invoke your function from a browser.
    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers":
                    "authorization, x-client-info, apikey, content-type",
            },
        });
    }

    try {
        const { description } = await req.json();
        // Create a Supabase client with the Auth context of the logged in user.
        const supabaseClient = createClient(
            // Supabase API URL - env var exported by default.
            Deno.env.get("SUPABASE_URL") ?? "",
            // Supabase API ANON KEY - env var exported by default.
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            // Create client with Auth context of the user that called the function.
            // This way your row-level-security (RLS) policies are applied.
            {
                global: {
                    headers: {
                        Authorization: req.headers.get("Authorization")!,
                    },
                },
            },
        );

        // First get the token from the Authorization header
        const token = req.headers.get("Authorization")!.replace("Bearer ", "");

        // Now we can get the session or user object
        const {
            data: { user: { id: userId } },
            // @ts-ignore: the auth package does exist deno is dumb
        } = await supabaseClient.auth.getUser(token);

        const resume = {
            ...(await supabaseClient.from("profiles").select("*").eq(
                "user_id",
                userId,
            )).data[0],
            jobs: (await supabaseClient.from("jobs").select("*").eq(
                "user_id",
                userId,
            ))
                .data,
            education: (
                await supabaseClient.from("education").select("*").eq(
                    "user_id",
                    userId,
                )
            ).data,
            skills: (
                await supabaseClient.from("skills").select("*").eq(
                    "user_id",
                    userId,
                )
            ).data,
            research: (
                await supabaseClient.from("research").select("*").eq(
                    "user_id",
                    userId,
                )
            ).data,
        };

        const thread = await openai.beta.threads.create();

        await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: "Resume: " + JSON.stringify(resume),
        });

        await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: "Job Description: " + description,
        });

        const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
            assistant_id: "asst_3HFJbKJM33LKr9VebGPu4ObI",
        });

        let response = "{}";

        if (run.status === "completed") {
            const messages = await openai.beta.threads.messages.list(
                run.thread_id,
            );
            response = messages.data.filter((m) => m.role === "assistant" //@ts-ignore: shut up this is fine
            )[0].content[0].text.value;
        } else {
            console.log(run.status);
        }

        return new Response(response, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers":
                    "authorization, x-client-info, apikey, content-type",
                "Content-Type": "application/json",
            },
            status: 200,
        });
    } catch (error) {
        // @ts-ignore: shut the fuck up deno
        return new Response(JSON.stringify({ error: error.message }), {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers":
                    "authorization, x-client-info, apikey, content-type",
                "Content-Type": "application/json",
            },
            status: 400,
        });
    }
});
