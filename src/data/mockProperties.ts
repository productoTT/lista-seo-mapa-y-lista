import type { Property, CommercialStatus, OperationType } from '../types/property';

const images = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80',
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&q=80',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80',
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=600&q=80',
];

function prop(
  id: string,
  title: string,
  price: number,
  address: string,
  zone: string,
  lat: number, lng: number,
  bedrooms: number, bathrooms: number, sqm: number,
  type: Property['type'],
  badges: Property['badges'],
  imgIdx: number,
  daysAgo: number,
  relevanceScore: number,
  operation: OperationType,
  commercialStatus: CommercialStatus,
  isNewProject: boolean,
  description: string,
): Property {
  const sqmExtra = [12, 18, 22, 15, 30, 10, 25, 20, 16, 28][parseInt(id) % 10];
  return {
    id, title, price,
    priceUF: Math.round(price / 38000),
    address, zone, lat, lng,
    bedrooms, bathrooms, sqm,
    sqmTotal: sqm + sqmExtra,
    type, badges,
    imageUrl: images[imgIdx % 8],
    listedAt: Date.now() - daysAgo * 86400000,
    relevanceScore,
    operation, commercialStatus, isNewProject, description,
  };
}

export const mockProperties: Property[] = [
  prop('1','Departamento en Ñuñoa',85000000,'Av. Irarrázaval 3456, Depto 52','Ñuñoa',-33.4569,-70.5993,2,1,58,'departamento',['new'],0,1,95,'venta','ai_recommended',false,'Departamento luminoso a pasos del metro Irarrázaval. Ideal para jóvenes profesionales que buscan conectividad y barrio.'),
  prop('2','Casa en Ñuñoa',120000000,'Av. Ossa 890, Casa','Ñuñoa',-33.4612,-70.5876,3,2,120,'casa',['price_drop'],1,5,88,'venta','featured',false,'Casa con jardín en barrio residencial tranquilo. Amplio living-comedor y cocina remodelada. Bajó de precio recientemente.'),
  prop('3','Departamento en arriendo',1200000,'Pedro de Valdivia Norte 234','Ñuñoa',-33.4490,-70.6050,1,1,42,'departamento',[],2,10,72,'arriendo','organic',false,'Studio acogedor a metros de Av. Grecia. Incluye estacionamiento y bodega. Disponible de inmediato.'),
  prop('4','Casa con patio en Ñuñoa',145000000,'Exequiel Fernández 1200','Ñuñoa',-33.4650,-70.5820,4,2,155,'casa',['opportunity'],3,3,90,'venta','sponsored',false,'Amplia casa con patio trasero de 80m², completamente remodelada el 2023. Barrio con mucho verde y excelente conectividad.'),
  prop('5','Depto con terraza, Ñuñoa',78000000,'Manuel Montt 567, Piso 8','Ñuñoa',-33.4530,-70.6100,2,2,65,'departamento',['new','opportunity'],4,2,93,'venta','ai_recommended',false,'Piso alto con terraza y vistas panorámicas. Edificio moderno con gimnasio. Gran relación precio-superficie.'),
  prop('6','Departamento en Providencia',195000000,'Av. Providencia 2340, Depto 121','Providencia',-33.4320,-70.6180,3,2,95,'departamento',['price_drop'],5,7,85,'venta','featured',false,'Excelente ubicación frente a parque, a dos cuadras del metro Pedro de Valdivia. Terminaciones de primer nivel.'),
  prop('7','Casa esquina Providencia',250000000,'El Golf 150, Casa esquina','Providencia',-33.4280,-70.6050,4,3,200,'casa',[],6,15,78,'venta','organic',false,'Casa de dos pisos en calle tranquila. Jardín delantero y trasero, amplio garage para 2 autos y sala de juegos.'),
  prop('8','Departamento en arriendo',990000,'Condell 890, Depto 32','Providencia',-33.4370,-70.6230,2,1,72,'departamento',['new'],7,1,91,'arriendo','ai_recommended',false,'Departamento amoblado en el corazón de Barrio Italia. A metros de restoranes y tiendas de diseño.'),
  prop('9','Casa en Providencia',320000000,'Av. Ricardo Lyon 1234','Providencia',-33.4250,-70.6130,5,3,280,'casa',['opportunity'],0,4,87,'venta','organic',false,'Majestuosa casa con piscina en barrio residencial consolidado. Hermosos jardines con árboles maduros.'),
  prop('10','Depto Barrio Italia',88000000,'Pio Nono 456, Depto 5B','Providencia',-33.4390,-70.6310,2,1,55,'departamento',[],1,20,65,'venta','organic',false,'Departamento con encanto en edificio patrimonial remodelado. Techos altos y detalles originales conservados.'),
  prop('11','Departamento en Las Condes',280000000,'Av. Apoquindo 6780, Piso 15','Las Condes',-33.4100,-70.5780,3,2,110,'departamento',['price_drop'],2,6,83,'venta','featured',false,'Piso 15 con vistas despejadas a la cordillera. Edificio con conserjería 24h y piscina temperada. Precio rebajado.'),
  prop('12','Casa en Las Condes',420000000,'Av. Los Leones 2300','Las Condes',-33.4050,-70.5650,5,4,320,'casa',[],3,25,70,'venta','organic',false,'Casa tradicional en sector residencial exclusivo. Jardín maduro con árboles, patio de juegos y barbacoa.'),
  prop('13','Proyecto nuevo Las Condes',165000000,'Estoril 455, Depto 201','Las Condes',-33.4170,-70.5900,2,2,82,'departamento',['new'],4,1,94,'venta','sponsored',true,'Proyecto de estreno con entrega inmediata. Terminaciones premium, cocina integrada y balcón privado con vista a la cordillera.'),
  prop('14','Departamento Las Condes',95000000,'Alonso de Córdova 3456','Las Condes',-33.4080,-70.5710,2,1,60,'departamento',['opportunity'],5,8,80,'venta','organic',false,'Departamento bien mantenido en ubicación privilegiada cerca de Parque Arauco. Buena conectividad al resto de la ciudad.'),
  prop('15','Casa familiar Las Condes',550000000,'Las Tranqueras 1800','Las Condes',-33.3980,-70.5580,6,5,450,'casa',[],6,30,60,'venta','organic',false,'Imponente casa en condominio privado. Piscina, cancha de tenis y sala de cine. Seguridad privada las 24 horas.'),
  prop('16','Departamento en Vitacura',380000000,'Vitacura 4200, Depto 81','Vitacura',-33.3950,-70.5900,3,2,130,'departamento',['price_drop'],7,9,77,'venta','featured',false,'Elegante departamento con terminaciones europeas. Cocina de mármol, vestidor y vista al parque Bicentenario.'),
  prop('17','Casa en Vitacura',680000000,'El Vergel 3100','Vitacura',-33.3880,-70.5780,5,4,380,'casa',[],0,45,55,'venta','organic',false,'Casa de arquitecto en sector exclusivo. Espacios de doble altura, materialidad de lujo y jardín curado.'),
  prop('18','Departamento moderno Vitacura',220000000,'Av. Bicentenario 3456, Depto 42','Vitacura',-33.4010,-70.5820,2,2,90,'departamento',['new','opportunity'],1,2,92,'venta','organic',false,'Nuevo departamento en el corazón de Vitacura. Diseño contemporáneo, terraza con parrilla y vista al parque.'),
  prop('19','Departamento en arriendo',650000,'Av. Libertador O\'Higgins 1234','Santiago Centro',-33.4490,-70.6600,1,1,38,'departamento',[],2,12,68,'arriendo','organic',false,'Studio en pleno centro con acceso directo al metro. Ideal para ejecutivos o estudiantes que buscan ubicación.'),
  prop('20','Proyecto inversión Santiago',72000000,'Monjitas 567, Depto 1203','Santiago Centro',-33.4380,-70.6520,2,1,50,'departamento',['new'],3,1,89,'venta','ai_recommended',true,'Proyecto de inversión en zona de alta demanda. Ideal para renta, cerca de universidades y oficinas corporativas.'),
  prop('21','Oficina Santiago Centro',48000000,'Catedral 890, Oficina 34','Santiago Centro',-33.4350,-70.6580,0,1,32,'oficina',['price_drop'],4,18,62,'venta','organic',false,'Oficina en edificio corporativo remodelado. Acceso 24 horas, sala de reuniones compartida y buena conectividad.'),
  prop('22','Departamento céntrico',95000000,'Merced 1100, Piso 12','Santiago Centro',-33.4420,-70.6490,3,2,78,'departamento',[],5,22,71,'venta','organic',false,'Departamento espacioso en edificio histórico. Pisos de madera, techos altos y mucha luz natural en todos los ambientes.'),
  prop('23','Departamento en arriendo',980000,'Miraflores 222, Depto 15A','Miraflores',-33.4410,-70.6540,2,1,54,'departamento',['opportunity'],6,5,82,'arriendo','organic',false,'Departamento amoblado a metros de Av. Libertador. Amplio y con bodega incluida. Disponible inmediatamente.'),
  prop('24','Departamento en arriendo',850000,'Agustinas 1200, Piso 9','Miraflores',-33.4430,-70.6510,2,2,68,'departamento',['new'],7,1,90,'arriendo','organic',false,'Departamento bien ubicado con cocina equipada. Perfecto para profesionales jóvenes en zona céntrica.'),
  prop('25','Casa en La Florida',95000000,'Av. Vicuña Mackenna 8900','La Florida',-33.5100,-70.5980,3,2,90,'casa',[],0,14,74,'venta','organic',false,'Casa luminosa con jardín delantero. Cerca del metro La Florida, con buena conectividad hacia el centro de Santiago.'),
  prop('26','Departamento en arriendo',680000,'Walker Martínez 1234, Depto 43','La Florida',-33.5180,-70.5890,2,1,48,'departamento',['price_drop'],1,11,69,'arriendo','organic',false,'Departamento económico en sector tranquilo. A minutos del metro en micro. Precio bajó este mes.'),
  prop('27','Casa familiar La Florida',118000000,'Av. La Florida 4500','La Florida',-33.5050,-70.6020,4,2,130,'casa',['new'],2,2,86,'venta','organic',false,'Casa amplia ideal para familia con niños. Patio trasero grande, sala de estudios y dos estacionamientos.'),
  prop('28','Casa en Peñalolén',88000000,'Av. Grecia 7800','Peñalolén',-33.4850,-70.5600,3,2,100,'casa',[],3,16,73,'venta','organic',false,'Casa cómoda en sector residencial de Peñalolén. Jardín, sala de estar separada y buen estado general.'),
  prop('29','Departamento en arriendo',720000,'Los Pinos 234, Depto 21','Peñalolén',-33.4920,-70.5510,2,1,52,'departamento',['opportunity'],4,7,79,'arriendo','organic',false,'Departamento acogedor con estacionamiento incluido. Cerca del mall Plaza Tobalaba y zona comercial.'),
  prop('30','Casa grande Peñalolén',135000000,'Tobalaba 12500','Peñalolén',-33.4780,-70.5680,4,3,160,'casa',['price_drop'],5,4,84,'venta','organic',false,'Gran casa con múltiples ambientes. Ideal para familia grande o quienes necesitan home-office independiente.'),
  prop('31','Departamento Irarrázaval',75000000,'Av. Irarrázaval 1200, Depto 31','Ñuñoa',-33.4545,-70.6020,2,1,60,'departamento',['new'],6,1,88,'venta','organic',false,'Departamento a estrenar con acabados modernos. Piso 8, sin vista obstruida, cerca del metro y el comercio.'),
  prop('32','Departamento Santa Isabel',98000000,'Santa Isabel 1800','Providencia',-33.4440,-70.6200,3,2,75,'departamento',[],7,9,76,'venta','organic',false,'Amplio departamento con living-comedor de doble espacio. Edificio con rooftop y vistas a la ciudad.'),
  prop('33','Oficina corporativa Vitacura',210000000,'Av. Vitacura 5500, Of. 1001','Vitacura',-33.4000,-70.5750,0,2,95,'oficina',[],0,35,58,'venta','organic',false,'Oficina corporativa con sala de reuniones privada. Estacionamientos incluidos, edificio clase A con certificación.'),
  prop('34','Proyecto de estreno Las Condes',145000000,'Av. Kennedy 7600, Depto 803','Las Condes',-33.4130,-70.5630,3,2,105,'departamento',['new'],1,1,93,'venta','sponsored',true,'Último piso disponible en edificio boutique de 8 pisos. Terminaciones de diseñador, cocina europea y terraza privada.'),
  prop('35','Inversión Santiago Centro',42000000,'San Francisco 890, Depto 4A','Santiago Centro',-33.4470,-70.6560,1,1,35,'departamento',['price_drop','opportunity'],2,3,85,'venta','ai_recommended',true,'Excelente oportunidad de inversión. Alta demanda de arriendo en zona universitaria. Rentabilidad estimada 6% anual.'),
  prop('36','Departamento El Bosque Norte',175000000,'El Bosque Norte 500','Las Condes',-33.4180,-70.5840,3,2,115,'departamento',[],3,19,66,'venta','organic',false,'Departamento clásico en sector consolidado. Piso tranquilo con buenas vistas y estacionamiento doble cubierto.'),
  prop('37','Departamento Ñuñoa',68000000,'Jorge Washington 456','Ñuñoa',-33.4580,-70.5950,2,1,56,'departamento',[],4,13,71,'venta','organic',false,'Departamento sin lujos pero bien ubicado. A pocas cuadras de parques, ferias y comercio típico de Ñuñoa.'),
  prop('38','Departamento con terraza',92000000,'Marchant Pereira 1100, Depto 62','Providencia',-33.4340,-70.6090,2,2,70,'departamento',['new'],5,2,87,'venta','organic',false,'Moderno departamento con cocina abierta y gran terraza con parrilla. Vista al parque, edificio con piscina y gimnasio.'),
  prop('39','Casa en Lo Barnechea',310000000,'Av. El Rodeo 12450','Las Condes',-33.3900,-70.5500,5,3,260,'casa',['price_drop'],6,8,76,'venta','organic',false,'Espaciosa casa en condominio privado en Lo Barnechea. Piscina comunitaria, áreas verdes y seguridad 24 horas.'),
  prop('40','Departamento en arriendo',520000,'Av. José Arrieta 4300, Depto 12','Peñalolén',-33.4860,-70.5640,1,1,40,'departamento',['opportunity'],7,6,81,'arriendo','organic',false,'Departamento económico bien equipado. Ideal para quienes buscan tranquilidad lejos del ruido del centro.'),
];

export const zones_list = ['Ñuñoa', 'Providencia', 'Las Condes', 'Vitacura', 'Santiago Centro', 'Miraflores', 'La Florida', 'Peñalolén', 'La Reina'];

export function formatPrice(price: number): string {
  if (price >= 1000000) return `$${(price / 1000000).toFixed(0)}M`;
  return `$${price.toLocaleString('es-CL')}`;
}

export function formatPriceUF(uf: number): string {
  return `UF ${uf.toLocaleString('es-CL')}`;
}

export function formatRent(price: number): string {
  return `$${(price / 1000).toFixed(0)}k/mes`;
}
