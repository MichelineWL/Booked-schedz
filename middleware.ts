import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    // Fetch the session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    // Log any errors fetching the session
    if (error) {
        console.error("Error fetching session:", error);
        return NextResponse.next();
    }

    // Log the session for debugging purposes
    console.log("Session:", session);

    // Check if the user is authenticated (session exists)
    if (!session) {
        // If not authenticated and not on the login page, redirect to login
        if (req.nextUrl.pathname !== '/login') {
            return NextResponse.rewrite(new URL('/login', req.url));
        }
        return res; // Allow access to login page
    }

    // Get the user's role from the database
    const { data: userData, error: roleError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single(); // Assuming 'id' is the unique identifier for the user

    if (roleError) {
        console.error("Error fetching user role:", roleError);
        return NextResponse.next(); // Handle role fetch error
    }

    const userRole = userData?.role || ''; // User's role fetched from the database

    // If user is not admin and trying to access admin pages, redirect
    if (userRole !== 'admin' && req.nextUrl.pathname.startsWith('/admin')) {
        // Redirect to home or a forbidden page
        return NextResponse.redirect(new URL('/forbidden', req.url));
    }

    // If user has session and correct role, proceed
    return res;
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)', // Match all routes except static and API
    ],
};
