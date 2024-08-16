# Project Setup

1. **Express Setup:**

```
mkdir <your project folder name> // create directory
cd <your project folder name> // go to the directory

npm init -y
npm install express // install express
```

2. **Paste the below code for initializing a server:**

```
const express = require('express') // import module
const app = express()
const port = 5000 // define port

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

```

# To Run Locally

1. **Clone the repository:**

   ```
   git clone https://github.com/nasib15/scic-client.git
   cd scic-client
   ```

2. **Install the dependencies:**

   ```
   npm install
   ```

3. **Start the development server:**

   ```
   nodemon index.js // MUST INSTALL nodemon
   ```

### Build for Production:

```
npm run build
```
