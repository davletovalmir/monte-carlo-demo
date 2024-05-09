# Monte Carlo Demo (Data is fun!)

This is the demo application for the Monte Carlo, developed by Almir Davletov<davletovalmir@gmail.com>.

## Datasets

I used 3 datasets here:

1. [World Happiness (2019)](https://www.kaggle.com/datasets/unsdsn/world-happiness?select=2019.csv)
2. [Internet Speed (2022)](https://www.kaggle.com/datasets/prashant808/global-internet-speed-2022)
3. Share of the population who cannot afford a healthy diet (I've lost the link to that one)

(1) and (2) are not matching by year, but for the demonstration purposes, I decided to still use it.

## Features

Application has 2 pages: Happiness Dashboard and Custom Dashboard. Let's break down each:

### Happiness Dashboard

Happiness Dashboard page is aware of used datasets and some of their characteristics, such as Country, Happiness Rank, Happiness Score etc. It aims to provide an opiniated way to analyze world happiness. We use combination of all datasets on this page.

The flow is simple:

1. Select your country
2. Review your country metrics
3. Compare top 5 countries above and below by the target metric (any metric)
4. Visualize data in table and charts format
5. Select another country to compare with
6. Compare your country to selected country side-by-side

Data visualizations allow some level of flexibility, but not all the flexibility. Interface is designed to be user friendly (but of course, still far from perfection) and guide on what you can do at each stage. Some table elements are interactive (Country, Header) and their functions are also explicitly outlined in the guidelines.

### Custom Dashboard

Custom Dashboard page is unaware of any datasets, except the fact that it knows what are the predefined datasets are and how to fetch them, but it doesn't know anything about their shape. This page is designed for more custom, general-purpose analytics by:

1. Joining datasets
2. Creating visualizations (table, chart)

You can not join ANY datasets, unless they have at least one common key. In our examples, it's Country. Derived (result of joining) datasets are saved in `IndexedDB` and preserved between the browser sessions. List of derived datasets, as well as visualizations, are stored in the `localStorage` for convenience.

While joining the datasets (or creating the table), I added support for filtering data. These filters are not exhaustive and not very flexible, but they do provide some basic functions over numbers and string. Filters can be chained with "and" and "or" logical operators, and resulting data can be limited.

Visualizations can be created per any existing dataset, and filtered to address analytical needs. They also can be deleted from the page.

Note: Both derived datasets and visualizations depend on the dataset structure that they were aware of at the moment of creation. If you change column names, things may and likely will break. This application is not designed to handle complex dependency changes, and instead follow naive and optimistic approach for simplicity.

## Project Structure

General inspiration on the project structure I used for this project is the following statement: "Things that change together must live together". What that means is that instead of having top-level `components` directory for every component, I prefer to identify the domain area (module), and organize given `components` in corresponding directories. It helps to separate the logic, keeps project organized and simplifies the navigation through the project.

### Routing

For routing we use Next.js Router. Entry points to the pages are in `src/pages/` directory. They don't carry any logic, but render the corresponding component with all the defined logics from `src/modules/` directory.

### Modules

Modules are located in `src/modules/` directory and isolating the page-specific components, hooks, utils etc. Everything inside the module is meant to **only be used** inside the module. Reusing them in other places would break the convention and lead to spaghetti code in future. They use shared store (Jotai) in order to reduce prop-drilling and increase efficiency of certain operations (derive data, share state etc.), but this store is exclusive to the module. Global store, if exists, must be placed in the `src/shared/` directory.

### Shared

Shared entities (components, hooks, utils) are located in `src/shared/` directory and structure similarly to `src/modules/` directory. For example, components, utils, types etc. for working with datasets are located in `src/shared/dataset/` directory. Shared UI components, such as buttons, popovers etc. are located in `src/shared/components/` directory.

### Datasets

Datasets that I used have been pre-processed before using them. I wanted to have more robust and reliable way of interacting with datasets, and know a little more about them than just their content. I added additional `schema` to understand the expected types, as well as `metadata` to understand the nature of given column, such as its trend (lower / higher better), unit, description etc.

All datasets are expected to have `name`, `schema` and `data`, but `metadata` is optional.

### Used libraries

To simplify the development, the following libraries were used:

1. Next.js (mainly for routing and API layer)
2. Tailwind (for styling)
3. Shadcn UI (for ready-to use UI components)
4. Jotai (for state management, derived values and syncing localStorage with state)
5. UseHooks TS (for ready-to use general-purpose hooks)
6. Tanstack Query (for better data-retrieval management)
7. Recharts (for building charts)
8. Tanstack Table (for building tables)

If I missed some other tools, feel free to ask me.

### Styling

As I'm not a UI/UX designer, design will feel inconsistent sometimes. I also didn't want to put more effort than required onto the design part.

## General Thoughts

Overall, it was very fun project to work on, and I learned a lot while working on it too. Building general-purpose data analytics tool is not easy, of course, and requires careful design and implementation to provide robust, bug-free experience, as well as maintain stable performance while dealing with the large amounts of data. I was thinking to introduce `WebWorkers` to offload some heavy computations from the main thread, but the datasets I'm using are relatively small and don't cause huge performance issues within the scope of this project. Though if you create tons of datasets and build hundreds of visualizations, I believe frustration because of poor performance is guaranteed.

## Scalability and Code Quality

This project can be scaled further, as I have separated reusable code from the knowledgeable code that aims to solve certain problem. Code might look messy, and in some places that would be fair point, as I haven't spent too much time on making it perfect. Though, even with that, it's likely readable and maintainable up to some extent.

You can play around by adding new datasets, that don't exist in this version, by making sure that the dataset structure is compatible with the `Dataset` type and adding the new dataset name to `PREDEFINED_DATASETS` in `src/shared/dataset/consts.ts` file.

## TODO

- [x] Define basic dataset structure with schema
- [x] Add dataset module with basic findJoinable, canJoin, join and filter methods
- [x] Add visualization / virtualization libs for: maps, tables, charts
- [x] Add datasets (world happiness, internet speed, healthy diet)
- [x] Visualize world happiness on the map
- [x] Visualize world happiness with the table
- [x] Visualize world happiness with the line chart, bar char and area chart
- [x] UI for joining datasets (see resulting data)
- [x] UI for filtering datasets (see resulting data and old counts)
- [x] UI for saving datasets (to Indexed DB)
- [x] UI for creating new tables
- [x] UI for saving new visualization (store as config in local storage)
- [x] Add happiness analytics dashboard (map, table, charts)
- [x] Compare 2 countries side-by-side
- [ ] UI to save visualization data as a dataset
- [ ] Merge dataset metadata and schema

## How to run

1. Install node modules with `npm i`
2. Then run the project with `npm run dev`
3. Enjoy the app, it's in http://localhost:3000!
