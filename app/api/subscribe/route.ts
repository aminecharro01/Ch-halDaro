import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { subscription: sub, prefs } = await request.json();

    // Validate subscription object
    if (!sub || !sub.endpoint || !sub.keys) {
      return NextResponse.json(
        { error: 'Invalid push subscription format' },
        { status: 400 }
      );
    }

    // Try to save to Supabase first (for authenticated users)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { error } = await supabase
            .from('subscriptions')
            .upsert(
              {
                user_id: user.id,
                subscription: sub,
                prefs: prefs || { goals: true, cards: true, yellow_cards: false, penalties: true, var: true, kickoff: true }
              },
              { onConflict: 'user_id' }
            );

          if (error) {
            console.error('Supabase subscription error:', error);
            return NextResponse.json(
              { error: `Failed to save subscription to database: ${error.message}` },
              { status: 500 }
            );
          }

          return NextResponse.json({
            success: true,
            message: 'Subscription saved',
          });
        }
      } catch (err) {
        console.error('Supabase error:', err);
        // Fall through to error response - don't use temporary storage
        return NextResponse.json(
          { error: 'Database connection failed. Please try again.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Push notifications not configured' },
      { status: 500 }
    );
  } catch (err: any) {
    console.error('Subscribe error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to process subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing subscription endpoint' },
        { status: 400 }
      );
    }

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Unsubscribe error:', error);
      return NextResponse.json(
        { error: 'Failed to unsubscribe' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Delete subscription error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('subscription, prefs')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is code for 'no rows returned'
      throw error;
    }

    return NextResponse.json({
      subscribed: !!data,
      prefs: data?.prefs || { goals: true, cards: true, yellow_cards: false, penalties: true, var: true, kickoff: true }
    });
  } catch (err: any) {
    console.error('Fetch subscription error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
