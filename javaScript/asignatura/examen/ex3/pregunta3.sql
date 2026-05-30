-- Pregunta 1
SELECT o.orderID
FROM Orders
WHERE o.orderID = od.OrderDetailsID
AND od.productID = p.ProductID
AND p.CategoryID = c.CategoryID
AND c.CategoryName = 'SeaFood';


-- Pregunta 2
SELECT ShipperID
FROM Shippers
JOIN o.OrdersID ON s.ShipperID = o.ShipperID

-- Pregunta 3
SELECT c.CustomerID
COUNT(o.OrderID) AS TotalPedidos
FROM Orders
Group BY c.CustomerID

-- Pregunta 4
SELECT Country,
COUNT(ProductID) AS TotalProductos
FROM Products
GROUP BY Country
