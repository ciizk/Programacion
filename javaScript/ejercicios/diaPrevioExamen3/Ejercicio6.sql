CREATE TABLE Orders (
    OrderID INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID INT NOT NULL,
    EmployeeID INT NOT NULL,
    OrderDate DATE NOT NULL DEFAULT GETDATE(),
    RequiredDate DATE NULL,
    ShippedDate DATE NULL,
    ShipVia INT NOT NULL,
    Freight DECIMAL(10,2) NULL,
    ShipName VARCHAR(100) NULL,
    ShipAddress VARCHAR(200) NULL,
    ShipCity VARCHAR(100) NULL,
    ShipRegion VARCHAR(100) NULL,
    ShipPostalCode VARCHAR(20) NULL,
    ShipCountry VARCHAR(100) NULL
);

-- Paso 1: obtener el ProductID del producto
SELECT ProductID
FROM Products
WHERE ProductName = 'Queso Cabrales';

-- Paso 2: insertar el pedido
INSERT INTO Orders (CustomerID, EmployeeID, ShipVia, OrderDate)
VALUES (1234, 6789, 5555, GETDATE());

-- Paso 3: insertar el detalle del pedido
INSERT INTO [Order Details] (OrderID, ProductID, UnitPrice, Quantity, Discount)
VALUES (
    SCOPE_IDENTITY(),
    (SELECT ProductID
     FROM Products
     WHERE ProductName = 'Queso Cabrales'),
    (SELECT UnitPrice
     FROM Products
     WHERE ProductName = 'Queso Cabrales'),
    5,
    0
);

SELECT p.ProductID, p.ProductName, s.CompanyName, s.Country
FROM Products p
INNER JOIN Suppliers s ON p.SupplierID = s.SupplierID
WHERE s.Country = 'Spain';