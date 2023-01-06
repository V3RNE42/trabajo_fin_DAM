## *SPANISH*    
# HELIOS
(Mi Trabajo de Fin de Ciclo para mi FP de DAM en el curso 2022-23. Empecé con él en Noviembre)

**HELIOS** es una app online útil para elegir asientos en un trayecto: en el lado izquierdo del vehículo, o en el derecho. 
Ya está. 
Esto puede ser útil a la hora de planificar el asiento teniendo en consideración múltiples factores, desde la piel fotosensible, la disrupción de ciclos circadianos por luz azul, si llevamos con nosotros algún tipo de batería que pueda cargarse con luz solar, o las razones que sean.


Para esto tiene en cuenta una serie de parámetros espacio-temporales que maneja dentro de unas **delimitaciones** para proveer al usuario final de una respuesta lógica.

**DELIMITACIONES**:   
1-Se asume un **trayecto rectilíneo** desde el punto de origen y el de destino. Esto quiere decir que, en ausencia de más información, el viaje será interpretado como una línea recta entre las coordenadas de origen y las de destino.    
2-Se asume una **velocidad constante**: aceleración, decelaración, y parada son conceptos ajenos al vehículo idealizado con el que trabaja el modelo de la app.   
3-Se asume que no hay alteraciones de altitud sobre el nivel del mar, ni túneles, tiempo nublado,o sombra proyectada por edificaciones y/o accidentes geográficos de ningún tipo.   
4-Se asume que trabajamos desde el **uso horario del punto de salida**, que será el reloj de referencia del viajero. Los cambios horarios derivados del movimiento entre husos horarios se verán reflejados en los resultados finales.    

**ALGORITMO FUNDAMENTAL:**  
+-----------+---------+    
| Izquierda | Derecha |    
+-----------+---------+------------------------+-------------+   
| SOL_____  | SOMBRA  | Antes Mediodia Solar   | Norte a Sur   |   
+-----------+---------+------------------------+-------------+   
| SOMBRA  | SOL_____  | Antes Mediodia Solar   | Sur a Norte   |    
+-----------+---------+------------------------+-------------+   
| SOL_____  | SOMBRA  | Tras el Mediodia Solar | Sur a Norte   |    
+-----------+---------+------------------------+-------------+   
| SOMBRA  | SOL_____  | Tras el Mediodia Solar | Norte a Sur   |    
+-----------+---------+------------------------+-------------+   

**CRÉDITOS ADICIONALES:**   
+ Es necesario acreditar a Volodymyr Agafonkin, creador del módulo SunCalc de JS, útil para averiguar el itinerario solar para unas coordenadas espaciotemporales dadas. Sin su trabajo, nada de esto sería posible.
+ He usado la API de OpenStreetMaps para hallar las coordenadas de los lugares de origen y destino
+ Es necesario acreditar también a Félix Gnass y Theodore Brown, creadores de https://spin.js.org/ , página que me ha resultado útil para dotar a la app de un spinner, muy útil para los tiempos de espera.
