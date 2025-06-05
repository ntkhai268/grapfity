SET IDENTITY_INSERT Users ON;

INSERT INTO Users (id, userName, email, password, roleId, createdAt, updatedAt, Name, Birthday, Address, PhoneNumber, Avatar)
VALUES
(1010, 'rage_against', 'rage_against@example.com', '12', 1, GETDATE(), GETDATE(), 'Rage Against The Machine', '1993-06-18', '123 Fake St', '0912345678', NULL),
(1011, 'daryl_hall_oates', 'daryl_hall_oates@example.com', '12', 1, GETDATE(), GETDATE(), 'Daryl Hall & John Oates', '1987-09-12', '456 Elm Rd', '0923456789', NULL),
(1012, 'will_young', 'will_young@example.com', '12', 1, GETDATE(), GETDATE(), 'Will Young', '1990-11-22', '789 Oak Ln', '0934567890', NULL),
(1013, 'bruce_cockburn', 'bruce_cockburn@example.com', '12', 1, GETDATE(), GETDATE(), 'Bruce Cockburn', '1985-02-15', '321 Pine Ave', '0945678901', NULL),
(1014, 'tori_amos', 'tori_amos@example.com', '12', 1, GETDATE(), GETDATE(), 'Tori Amos', '1992-08-09', '654 Maple Dr', '0956789012', NULL),
(1015, 'kate_campbell', 'kate_campbell@example.com', '12', 1, GETDATE(), GETDATE(), 'Kate Campbell', '1988-04-30', '987 Cedar St', '0967890123', NULL),
(1016, 'death_desire', 'death_desire@example.com', '12', 1, GETDATE(), GETDATE(), 'Death & Desire', '1991-12-01', '246 Birch Rd', '0978901234', NULL),
(1017, 'zebrahead', 'zebrahead@example.com', '12', 1, GETDATE(), GETDATE(), 'zebrahead', '1995-07-17', '135 Spruce Ct', '0989012345', NULL),
(1018, 'ani_difranco', 'ani_difranco@example.com', '12', 1, GETDATE(), GETDATE(), 'Ani DiFranco', '1994-10-05', '753 Cherry Blvd', '0990123456', NULL),
(1019, 'rufio', 'rufio@example.com', '12', 1, GETDATE(), GETDATE(), 'Rufio', '1996-03-27', '159 Redwood Ln', '0901234567', NULL),
(1020, 'daryl_hall_oates2', 'daryl_hall_oates2@example.com', '12', 1, GETDATE(), GETDATE(), 'Daryl Hall & John Oates', '1986-01-14', '369 Cypress Ave', '0912345670', NULL),
(1021, 'bride', 'bride@example.com', '12', 1, GETDATE(), GETDATE(), 'Bride', '1989-09-09', '147 Willow Rd', '0923456781', NULL),
(1022, 'the_call', 'the_call@example.com', '12', 1, GETDATE(), GETDATE(), 'The Call', '1993-05-05', '258 Fir Dr', '0934567892', NULL),
(1023, 'bride2', 'bride2@example.com', '12', 1, GETDATE(), GETDATE(), 'Bride', '1991-06-21', '369 Maple St', '0945678903', NULL),
(1024, 'nodesha', 'nodesha@example.com', '12', 1, GETDATE(), GETDATE(), 'Nodesha', '1997-02-02', '753 Dogwood Ct', '0956789014', NULL),
(1025, 'daryl_hall_oates3', 'daryl_hall_oates3@example.com', '12', 1, GETDATE(), GETDATE(), 'Daryl Hall & John Oates', '1984-10-28', '321 Magnolia Ln', '0967890125', NULL);

SET IDENTITY_INSERT Users OFF;
GO
