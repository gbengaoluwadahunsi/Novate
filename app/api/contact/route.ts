import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, company, phone } = body;

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields. Name, email, subject, and message are required.' },
        { status: 400 }
      );
    }

    // Length validation
    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 100 characters.' },
        { status: 400 }
      );
    }

    if (subject.length < 5 || subject.length > 200) {
      return NextResponse.json(
        { error: 'Subject must be between 5 and 200 characters.' },
        { status: 400 }
      );
    }

    if (message.length < 10 || message.length > 2000) {
      return NextResponse.json(
        { error: 'Message must be between 10 and 2000 characters.' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Optional field validation
    if (company && company.length > 100) {
      return NextResponse.json(
        { error: 'Company name must be less than 100 characters.' },
        { status: 400 }
      );
    }

    if (phone && phone.length > 20) {
      return NextResponse.json(
        { error: 'Phone number must be less than 20 characters.' },
        { status: 400 }
      );
    }

    // In development, just log the contact request
    console.log('Contact Form Submission:', {
      name,
      email,
      subject,
      message,
      company,
      phone,
      timestamp: new Date().toISOString()
    });

    // For development, simulate success response
    // In production, this would send emails and store in database
    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send your message. Please try again later.' },
      { status: 500 }
    );
  }
}
