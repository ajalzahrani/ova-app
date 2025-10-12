This is the OVA reporting system.

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
- [ ] Allow user to update mobile number & email from user profile page.
- [ ] Add first login password change.
- [ ] Let user to choose notification types (create, referral, messages, resolved)
- [ ] Add notification enable for specific occurrance within occurrence details page.

## Errors Solved

npx prisma generate

Error:
EPERM: operation not permitted, rename

Solution:
taskkill /f /im node.exe
SUCCESS: The process "node.exe" with PID 61596 has been terminated.
SUCCESS: The process "node.exe" with PID 63884 has been terminated.
SUCCESS: The process "node.exe" with PID 63604 has been terminated.
ERROR: The process "node.exe" with PID 64996 could not be terminated.
