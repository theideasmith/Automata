A list of awesome frameworks to use

+ ReactJs
+ CylonJS (for controlling the physical world)
+ CycleJS (Human-Computer interaction)
+ Webdriver-selenium
+ Material Design framework: https://www.muicss.com/
+ React Semantic UI: https://www.npmjs.com/package/react-semantic-ui
+ Dragulas

More powerful systems:

+ Distributed Systems: https://www.npmjs.com/package/pm2
+ Use cluster, rabbitmq, etc to easily scale horizontally
+ Package apps with Docker
+ C/C++ Addons
+ JXCore to multithread and do process monitoring.

I want this to be a high level way of writing specialized solutions to software problems. At such a high level, with many individual components, one of the trickiest parts will be figuring out how to structure the execution of a single workflow so that it runs as fast as possible, with as little side effects as possible. Spinning up 1,000,000 instances of a number crunching app should simply be as easy as taking the block that you want to run, and calling it in distributed computing mode, packaging up the app in docker with a block, deploying the docker app to AWS EC2 with another block, and running it.

Automata will have a standard mode of presentation so developers can focus only on content. Just like Mark Zuckerberg, simplifying things to a efficient standard reduces useless computation and optimizes human’s workflow. Therefore, there will be a standard mode of conveying different types of information, a standard mode of editing different types of information, regardless of its source, so the focus shifts from being on how something is done, to what is actually being done.

###Standard:

+ File viewing as PDF (quick look)
+ Mail
+ Spreadsheet / CSV
+ Markdown
+ Code
+ Images
+ Vector graphics
+ XML
+ JSON
+ Bitmap graphics
+ Rtf
+ Rendering HTML
+ Mp3

And a standard for storing and reading all these filetypes, so you don’t have the .docx, .pages problem.

Additionally, Automata is basically like a graphical terminal. The concept of a modular system for accomplishing tasks was already created by developers a while ago (in the form of things like Bash), which allows for piping, etc. to chain commands and build powerful, modular workflows.

Automata aims to be the terminal equivalent for the 21st century.

Summary:

`Automata : Shell :: Atom : Vim`

##Packages
### WebRiver
The first package, and inspiration for this altogether.
Automating Interaction with a browser using a JSON DSL, for making repetitive tasks easier and creating an API for websites without one

##Roadmap/TODO

+ **PackageRegistry** for sets to register their API with. It manages static information related to sets
+ **FunctionPromoters**: a way of turning on and off various functions depending on the state of this program. This ensures only the correct functions can be called at any given time.
+ **MultiStreams**: A way of streaming data from multiple pipes to the same place. Data arrives hashed. MultiStreams will make it very easy to do things like: waiting for all data to arrive before emitting `data` event, or only sending the first and ignoring all subsequent pieces of data. Validating data before allowing it to "enter", and other ways for coercing complex streams to behave their best.
+ **Package Loader**: loads packages by running their `definition` function passed through the `module.exports` of their main.js or equivalent thereof, specified in the package.json under `"main"`.
+ **Compiler/Validator**: validates a workflow, ensuring it meets all the specifications of its various blocks in terms of typechecking, dependency blocks being preceded by dependency blocks, etc.
+ **Automata Runtime**
    + An intermediate function between blocks that does:
        + Internal state management and updates on status of "block-program".
        + Validates the actual output of the functions if they are in tandem with their output declaration and with the input declaration of subsequent blocks.
    + Watches for recursiveness, infinite loops, and block timerunning, ensuring everything goes smoothly and giving users the option to stop if blocks take too long to execute.
    + Communicates betwen main process and "block-program" process, fulfilling requests of the "block-program."

One of the biggest challenges will be ensuring this complex system runs safely and quickly without any significant bottlenecks. There can be an arbitrary number of blocks, some of which run asyncronously, all streaming data to other blocks, which in turn run their own processes and .
