const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const port = 3001;

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dueDate: { type: Date, required: true }
});

const Product = mongoose.model('Product', ProductSchema);

const currentDate = new Date();

app.get('/', async (req, res) => {
  try {
    const products = await Product.find();

    const sortedProducts = products.sort((a, b) => a.dueDate - b.dueDate);

    const updatedProducts = sortedProducts.map(product => ({
      ...product.toObject(),
      vencido: product.dueDate < currentDate,
      vencendo: product.dueDate < new Date(currentDate.getTime() + (30 * 24 * 60 * 60 * 1000))
    }));

    res.send(updatedProducts);
  } catch (error) {
    console.error('Erro ao buscar e processar produtos:', error);
    res.status(500).send('Erro ao buscar produtos');
  }
});

app.delete('/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.send(true);
});

app.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    product.validateSync();
    await product.save();
    res.send(product);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.listen(port, () => {
  mongoose.connect('mongodb+srv://eduardoldarocha:5Ztaek6Nlh902mc6@mongodbapi.ysmde01.mongodb.net/?retryWrites=true&w=majority&appName=MongoDbApi')  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
  
  console.log('App running');
});
