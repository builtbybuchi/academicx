aina@example.com
buchi@gmail.com
muiw@example.com
muller@example.com
jess@example.com
chika@example.com
naza@example.com
camilla@example.com
clement@example.com
claire@example.com

Admin email        AMSI - X password123

{
  "primary": "#0e7490",      // Teal
  "secondary": "#64748b",    // Cool Gray
  "accent": "#22d3ee",       // Bright Cyan
  "background": "#f0f9ff",   // Very Light Blue
  "text": "#1e2937"
}

{
  "primary": "#1e2937",      // Dark Charcoal
  "secondary": "#334155",    // Slate
  "accent": "#dc2626",       // Bold Red
  "background": "#ffffff",
  "text": "#0f172a"
}

{
  "primary": "#be185d",      // Rose Pink
  "secondary": "#831843",    // Deep Maroon
  "accent": "#f472b6",       // Soft Pink
  "background": "#fdf4ff",   // Light Lavender
  "text": "#1f2937"
}

{
  "primary": "#1e40af",      // Bright Blue
  "secondary": "#0f172a",    // Almost Black
  "accent": "#22d3ee",       // Cyan
  "background": "#f8fafc",
  "text": "#1e2937"
}

{
  "primary": "#b45309",      // Warm Orange
  "secondary": "#78350f",    // Deep Orange-Brown
  "accent": "#fbbf24",       // Sunny Yellow
  "background": "#fffbeb",   // Soft Cream
  "text": "#1f2937"
}

{
  "primary": "#7f1d1d",      // Deep Red
  "secondary": "#431407",    // Dark Brown-Red
  "accent": "#f59e0b",       // Amber
  "background": "#ffffff",
  "text": "#1f2937"
}

logo: 
https://placehold.co/280x80/1e3a8a/white?text=ACADEMIX


tagline: 
Nurturing Excellence, Building Character
  
mainHeadline: 
Shaping Tomorrow's Leaders Today

subHeadline: 
A world-class institution committed to academic excellence, moral values, and holistic development since 2015.

story: 
AcademiX Model School was founded in 2015 with a vision to redefine quality education in Nigeria. What began as a small group of passionate educators has grown into one of the most respected co-educational institutions in Lagos. We believe every child deserves an education that goes beyond textbooks — one that builds character, ignites curiosity, and prepares them to thrive in a rapidly changing world.

image1: 
https://placehold.co/800x600/1e3a8a/ffffff?text=School+Campus

image2: 
https://placehold.co/800x600/334155/ffffff?text=Students+in+Class

schoolAnthem: 
Arise, O AcademiX, shine your light so bright,\nWith knowledge as our weapon and wisdom as our might.\nWe stand for truth and excellence in all we do,\nAcademiX Model School, we pledge our hearts to you.\n\nFrom Lagos to the nations, our banner we shall raise,\nWith discipline and diligence, we’ll walk in honour’s ways.\nUnited we shall conquer, in purpose strong and true,\nAcademiX forever, we proudly stand for you!

schoolPledge: 
I pledge to AcademiX Model School,\nTo be honest, respectful and kind.\nTo study with diligence and discipline,\nTo respect my teachers, my parents and my peers.\nTo uphold the values of integrity and excellence,\nAnd to be a worthy ambassador of my school.\nSo help me God.

principalPledge: 
As Principal of AcademiX Model School, I pledge to:\n• Provide every student with quality education and equal opportunity.\n• Create a safe, inclusive and inspiring learning environment.\n• Lead with integrity, compassion and excellence.\n• Partner with parents and the community to raise future-ready leaders.\n• Uphold the highest standards of discipline and moral values.\nThis is my solemn commitment to every child entrusted to our care.

vision: 
To be a leading global institution that produces morally sound, academically excellent, and innovative leaders who positively impact society.

mission: 
To be a leading global institution that produces morally sound, academically excellent, and innovative leaders who positively impact society.

coreValues: 
title: 
Excellence
description: 
We pursue the highest standards in academics and character.

title: 
Integrity
description: 
We uphold honesty, transparency and moral uprightness in all we do.

title: 
Respect
description: 
We treat every individual with dignity and kindness.

title: 
Innovation
description: 
We encourage creativity and forward-thinking solutions.

title: 
Discipline
description: 
We believe discipline is the foundation of true freedom and success.

  

principalWelcome: 
Dear Parents and Students,\n\nWelcome to AcademiX Model School — a place where dreams take flight and potential is transformed into achievement.\n\nAt AcademiX, we do not just teach subjects; we nurture minds, shape character, and prepare young people for a future full of possibilities. Our dedicated teachers, state-of-the-art facilities, and values-driven curriculum create the perfect environment for every child to discover their unique talents and purpose.\n\nWhether your child is just beginning their educational journey or preparing for higher education, we are committed to walking alongside them every step of the way.\n\nWe look forward to partnering with you in raising exceptional leaders of tomorrow.\n\nWarm regards,\n\nDr. Grace A. Thompson\nPrincipal, AcademiX Model School


address: 
12 AcademiX Avenue, Lekki Phase 1, Lagos, Nigeria

phone: 
+234 803 123 4567

email: 
info@academixmodel.edu.ng

schoolHours: 
Monday - Friday: 7:30 AM - 3:30 PM

socials:
facebook: 
https://facebook.com/academixmodel
instagram: 
https://instagram.com/academixmodel
twitter: 
https://twitter.com/academixmodel

Aside from the hero images, two other images are used. Allow the schools to manipulat those images. 

The title of the website should be the school name and the favicon should be the school logo. 

Implement event, news and gallery fetching detials from the DB. 

Build the student login flow on the school website. So they have two options, to pay school fees and to view result. So they select academic session, before school fees are paid, check the DB to be sure they are not paying for same term twice. School fees are published by the school, school fees not published by the school should not be accessible to the students. After the fees are paid. The charge for payment should be 1.9% 1.2 percent is squadco charge and 0.5% is platform fee. The fee is capped at 2500


Add buy custom domain for the school as an app in the admin page website section. They should see that domains are managed by Drave Registry. With drave registry logo boldly displayed on the pop up(). Only allow .com(15 dollars, renews at 17 dollars), .org(10 dollars), .com.ng(9 dollars, renews at 11 dollars), .ng(15 dollars, renews at 17 dollars), .org.ng(6 dollars, renews at 8 dollars), .sch.ng(9 dollars, renews at 11 dollars). Use an check-domain npm library to check domain name availability before the schools are directed to make payment. Use exchange-rate-api to convert the dollars to naira. The dollars converted should be stored on the website, when prices are requested on the frontend, it should check the exchange rate, if the rates are not contained in the website then they fetch from the api and update it so subsequent requests don't need to call the api again. The only currency of interest at the moment is naira so they can make the payment in naira via squad co. After successful payment. The super admin should receive a notification that a domain is requested. And should receive an email to info@lexrunit.com. After they have made the payment they should see a pop-up that Drave Registry would update their website in less than 7 working days. The new/custom domain name chooses should be stored in the DB. 

In the school admin panel add a financial tab, for tracking fees payment. 

After publishing result for a term schools are requested to set the school fees for the next term, these schools fees can include a school fees breakdown, this is authomatically emailed to all parents. After publishing result for the last semester, admin should be reminded to setup the app for the next academic session. At this stage, the students are upgraded to the next class automatically. Then subjects can be updated, though all defaults from the previous session is used as the default to make edits easier. 

Staffs and students can be suspended or sacked or expelled. This should soft delete the staff or students details. 


Build the scores recording process in the staff app. Build the attendance marking flow in the staff app. 

Build the staff attendance taking in the staff app. This feature is only accessible to the staff with the previledge to take staff attendance and not all staffs. 

Add a view checkins section for staff app and view attendance section section in the students app. 

Build the fees section in the student app so they can view all the fees they have apid in the school from that section, they can also see if they have paid for the current section. 