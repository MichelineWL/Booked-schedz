// the route where we are goint to call to sign up a user 
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    const url = new URL(req.url);
    const cookieStore = cookies();

    const formData = await req.formData();

    const email = String(formData.get('email'))
    const password = String(formData.get('password'))

    const supabase = createRouteHandlerClient({
        cookies: () => cookieStore
    })

    const {data, error } = await supabase 
        .auth
        .signInWithPassword({
           email, password
        });

    // Handle error
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.redirect(url.origin, {
        status: 301
    })
}