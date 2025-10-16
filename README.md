OVA is a comprehensive, user-friendly web application built for healthcare professionals—nurses, doctors, allied health staff, and support workers—to mitigate the risk of occupational violence and aggression, provide real-time guidance during incidents, and ensure prompt post-incident support and reporting.

The app promotes a proactive safety culture by placing education, risk assessment, and rapid response protocols directly into the hands of frontline staff, reducing the frequency and severity of OVA incidents and their negative impact on staff well-being and patient care.

## Getting Started

1. Clone the repository
2. Run `npm install`
3. Run `npm run prisma:migrate`
4. Run `npm run prisma:seed`
5. Run `npm run dev`

## Todo

- [ ] Fix session expiration navbar issue.
- [ ] Add server actions guard.
- [x] Add user feedback shared link.
- [x] Use user email for notification.
- [x] Allow user to update mobile number & email from user profile page.
- [x] Add first login password change.
- [ ] Let user to choose notification types (create, referral, messages, resolved)
- [ ] Add notification enable for specific occurrance within occurrence details page.

## Errors Solved

```terminal
npx prisma generate
```

Error:
EPERM: operation not permitted, rename

Solution:

```terminal
taskkill /f /im node.exe
```

## Production notes

remove adminpassword & password123 from login page
remove testing_emails
edit password regx
