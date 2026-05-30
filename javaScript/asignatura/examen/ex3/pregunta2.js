// Pregunta 1 Como lo escribi en el examen
/*async function getNombresPorPedido(idPedido) {
    const sql = `
    SELECT productName 
    FROM products
    JOIN ProductName = ProductID
    JOIN ProductID = OrderDetailID
    JOIN OrderDetailID = ${idPedido}
    `;
    return await this.ejecutarSQL(sql);
}
*/
// Pregunta 1 Corregido, me falto hacer los JOIN correctamente y usar el nombre correcto de las tablas
async function getNombresPorPedido(idPedido) {
    const sql = `
    SELECT p.ProductName 
    FROM Products p
    JOIN Order Details od 
        ON p.ProductID = od.ProductID
    WHERE od.OrderID = ${idPedido}
    `;
    return await this.ejecutarSQL(sql);
}



// Pregunta 2 Como lo escribi en el examen
/* app.get('api/Productos/nombre', async function(req, res) {
    try{
        let resultado = 
        await laLogica.getNombresPorPedido(req.params.nombre) 
        req.send(resultado)
    } catch (error) {
        res.status(500).send(error);
    }
});
*/

// Pregunta 2 Corregido, me falto poner el slash al inicio de la ruta y usar res.send en lugar de req.send
app.get('/api/Productos/:idPedido', async function(req, res) {
    try {
        let resultado = await laLogica.getNombresPorPedido(req.params.idPedido);
        res.send(resultado);
    } catch (error) {
        res.status(500).send(error);
    }
});