# LooktteryApp

This project is a main micro-frontend ready to work with core-shell project.

# Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

Can´t run with configurations, update environment.development.ts ip´s if use android emulator or real device.

# Build files for lookttery-static and publish version

Run this command to generate a production dist folder.

```terminal
npm run build-production
```

Copy dist/lookttery-app files and publish to a web server. We use the lookttery-static project publish like github page.

Push lookttery-static new changes to main branch, this update the publish version.
