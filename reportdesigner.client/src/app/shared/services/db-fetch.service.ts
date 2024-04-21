// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { DatabaseInfoService } from './database-info.service';

// @Injectable({
//   providedIn: 'root'
// })
// export class DbFetchService {
//   databaseInfo: any = [];

//   constructor(private http: HttpClient, private dbService: DatabaseInfoService) { }

//   fetchDbData(): Promise<void> {
//     return new Promise<void>((resolve, reject) => {
//       this.databaseInfo = { databases: [] }; // Clear existing data
//       this.dbService.getDatabases().subscribe((databases) => {
//         databases.forEach((database) => {
//           const dbObject: any = {
//             name: database,
//             tables: [],
//           };

//           this.dbService.getTables(database).subscribe((tables) => {
//             const tableDataPromises = tables.map((table) => {
//               return this.dbService.getTableData(database, table).toPromise();
//             });

//             Promise.all(tableDataPromises).then((tableDataArray) => {
//               tables.forEach((table, index) => {
//                 const tableObject: any = {
//                   name: table,
//                   data: tableDataArray[index],
//                 };
//                 dbObject.tables.push(tableObject);
//               });

//               this.databaseInfo.databases.push(dbObject);

//               // Store databaseInfo in local storage after all tables are fetched for the database
//               localStorage.setItem(
//                 'databaseInfo',
//                 JSON.stringify(this.databaseInfo)
//               );
//               console.log(this.databaseInfo);

//               resolve(); // Resolve the Promise after data fetching is complete
//             });
//           });
//         });
//       });
//     });
//   }

//   // Method to retrieve the fetched database info
//   getDatabaseInfo(): any {
//     return this.databaseInfo;
//   }
// }
