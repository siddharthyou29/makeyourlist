import express from 'express';
import { createClient } from '@supabase/supabase-js';
import bodyParser from 'body-parser';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Check if credentials are set
if (!supabaseUrl || !supabaseKey) {
    console.error("FATAL ERROR: SUPABASE_URL and SUPABASE_ANON_KEY must be set in your .env file.");
    process.exit(1);
}

// Create the Supabase client instance
const supabase = createClient(supabaseUrl, supabaseKey);

const port = 3000;
const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// --- GET All Tasks ---
app.get('/', async (req, res) => {
    // 1. Fetch data using the Supabase client
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*');

    if (error) {
        console.error('Supabase fetch error:', error);
        return res.status(500).send("Database Error. Check your Supabase configuration and RLS policies.");
    }

    // 2. Format data for the EJS template (maintaining original structure)
    const formattedData = tasks.map((d) => ({
        id: d.id,
        title: d.title,
        struck: d.done // Mapping 'done' column to 'struck' property
    }));

    res.render('index.ejs', { data: formattedData });
});

// --- POST Delete Task ---
app.post('/deli', async (req, res) => {
    const id = req.body.delId;
    
    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Supabase delete error:', error);
    }

    res.redirect('/');
});

app.post('/submit', async (req, res) => {
    const taskTitle = req.body.task;

    const { error } = await supabase
        .from('tasks')
        .insert({ title: taskTitle, done: true });

    if (error) {
        console.error('Supabase insert error:', error);
    }

    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});