Authentication & User Management

POST/api/auth/register
Register a new user or onboard an employee.

POST/api/auth/login
Log in to your account, with support for extra security steps.

POST/api/auth/refresh
Get a new login token to stay signed in.

POST/api/auth/logout
Log out and end your session securely.

POST/api/auth/forgot-password
Start the process to reset your password if you forget it.

POST/api/auth/verify-email
Confirm your email address for account security.

GET/api/users/profile
View your personal profile information.

PUT/api/users/profile
Update your profile details.

DELETE/api/users/profile
Deactivate your account (can be reactivated later).

GET/api/users/tenants
See which organizations you have access to.

POST/api/users/switch-tenant
Change which organization you are currently working with.
