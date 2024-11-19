import express from 'express'
import multer from 'multer'
import { readdir, readFile } from 'fs/promises'
import { resolve } from 'path'
import markdownit from 'markdown-it'
const md = markdownit()

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix+file.originalname)
    }
})

const upload = multer({ storage: storage })
const app = express()
app.use(express.json())

app.post('/notes', upload.single('file'), (req, res) => {
    try {
        res.status(200).json({ success: "file upload successful" })
    } catch (error) {
        res.status(500).json({ error: error })
    }
})

app.get('/notes', async (req, res) => {
  try {
    const files = await readdir('uploads');

    let result

    for (const file of files) {
      result += file + '\n'
    }
    
    res.send(result)
  } catch (err) {
    res.status(500).json({ error: err })
  } 
})

app.get('/notes/:file/', async (req, res) => {
  try {
    const filePath = resolve('./uploads/', req.params.file)
    const contents = await readFile(filePath, { encoding: 'utf8' });

    const result = md.render(contents);

    res.status(200).send(result)
  } catch (err) {
    res.status(500).json({ error: err })
  }
})

app.listen(3000, () => console.log('Server listening on port 3000'))