Installing Your First KendoReact Component
Prerequisites
KendoReact now offers seamless compatibility with React 19, empowering you to build modern, fast, and robust UI components with confidence. Start building with the latest version of React today!

React 18 (or a version >= 16.8.x)
NodeJS LTS (or a version >= 14). Use the node -v command to check your node versions.
A bash terminal of your choice, for example, the one available in the Visual Studio Code console.
1. Creating the React App
The easiest way to start with KendoReact is to use the create-vite tool to bootstrap a KendoReact project supporting both JSX and TypeScript. The tool handles the following tasks for you:

Creates a new KendoReact project.
Configures the project to use TypeScript or JavaScript.
Optionally adds SASS support.
To start your first KendoReact project:

Use npm to create and run the vite application.

sh

npm create vite@latest
or

sh

yarn create vite
After executing the command, the interface will ask you to apply additional configurations to your project:

Set the project name:
Here you can define the name of your project. For the needs of the current article, set the name of the application as my-app.

When prompted, complete the step-by-step interactive project configuration. Make sure to select React as the project framework. You can choose any of the suggested variants.

Finally, run the newly created project.

sh

cd my-app
npm i
npm run dev
You can skip the step-by-step project configuration by specifying the project name and adding -- --template if you are using NPM or --template if you are using Yarn straight from the command line. See Scaffolding Your First Vite Project for more CLI options.

sh

#npm
npm create vite@latest my-app -- --template react

# yarn
yarn create vite my-app --template react
2. Create a Vite Project using Kendo CLI
As an alternative to the default way of creating Vite projects, the Kendo CLI helps you generate projects with JavaScript or TypeScript. To generate a project with the Kendo CLI, you have to do the following:

Install the @progress/kendo-cli package using the following command:
shell

npm i -g @progress/kendo-cli
Use the following command to generate a new Vite project with Typescript:
shell

npx kendo react create vite MyKendoApp
The CLI also provides an option to define which Kendo Theme will be added to the generated project. To set a theme, add one of the following to the above commands:

--theme=default - Adds the Kendo Default Theme
--theme=bootstrap - Adds the Kendo Bootstrap Theme
--theme=material - Adds the Kendo Material Theme
--theme=fluent - Adds the Kendo Fluent Theme
The CLI allows you to specify the preferred styling. By default, the project will use CSS, but you can specify Sass if needed:

--styling=CSS - Use CSS styling (default)
--styling=Sass - Use Sass styling
The result of using the Kendo CLI will be a Vite project that has a KendoReact Grid component added to it. The Kendo CLI helps you test the KendoReact components fast and easy, but you can still use the Vite CLI, if preferred.

Below you will find information on how to add components to a Vite project, no matter how it is generated.

3. Using KendoReact Components
KendoReact is a library of 120+ UI components. In this section, you’ll learn how to use one of these components, the React Calendar, in only two steps.

The create-vite tool has already installed all KendoReact components and their dependencies. So the next step to use any of these components is importing them. KendoReact is distributed as multiple npm packages scoped to @progress. For example, the Calendar component is part of the @progress/kendo-react-dateinputs package.

Install the dependencies for KendoReact Calendar, Grid, DropDownList and Window:
sh

npm i @progress/kendo-react-dateinputs @progress/kendo-react-grid @progress/kendo-react-dropdowns @progress/kendo-react-dialogs
Import the Calendar into src/App.js.

jsx

import { Calendar } from '@progress/kendo-react-dateinputs';
Then, add the Calendar component to your markup. Now you have a fully functioning calendar in two lines of code!

jsx

return (
    <div className="App">
        <h1>Hello KendoReact!</h1>
        <Calendar />
    </div>
);
Remove the default styling that is applied to the project by removing the index.css import in main.jsx.

To style the Calendar component as well as the other KendoReact components, install the Default theme, which is one of the four beautiful themes for KendoReact.

sh

npm i @progress/kendo-theme-default
Import the KendoReact Default theme in your main.jsx.
jsx

import '@progress/kendo-theme-default/dist/all.css';
After completing the above steps, run the project using npm run dev and navigate to the URL displayed in the console. You can view all the available commands in the scripts property in package.json.

Using any other KendoReact component is as straightforward as using the Calendar—you import the component and use the component’s markup in your apps.

As a final step to getting KendoReact up and running, let’s look at how to handle licensing.