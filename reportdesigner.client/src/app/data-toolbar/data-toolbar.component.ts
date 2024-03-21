import { Component } from '@angular/core';
import { DatabaseInfoService } from '../database-info.service';

@Component({
  selector: 'app-data-toolbar',
  templateUrl: './data-toolbar.component.html',
  styleUrl: './data-toolbar.component.css',
})
export class DataToolbarComponent {
  // databaseInfo: any = [];

  // constructor(private dbService: DatabaseInfoService) {}

  // ngOnInit(): void {
  //   const storedDatabaseInfo = localStorage.getItem('databaseInfo');
  //   if (storedDatabaseInfo) {
  //     this.databaseInfo = JSON.parse(storedDatabaseInfo);
  //   } else {
  //     this.fetchDbData();
  //   }
  // }

  // reloadDbData(): void {
  //   localStorage.removeItem('databaseInfo');
  //   this.fetchDbData();
  // }

  // fetchDbData() {
  //   this.databaseInfo = { databases: [] }; // Clear existing data
  //   this.dbService.getDatabases().subscribe((databases) => {
  //     databases.forEach((database) => {
  //       const dbObject: any = {
  //         name: database,
  //         tables: [],
  //       };

  //       this.dbService.getTables(database).subscribe((tables) => {
  //         const tableDataPromises = tables.map((table) => {
  //           return this.dbService.getTableData(database, table).toPromise();
  //         });

  //         Promise.all(tableDataPromises).then((tableDataArray) => {
  //           tables.forEach((table, index) => {
  //             const tableObject: any = {
  //               name: table,
  //               data: tableDataArray[index],
  //             };
  //             dbObject.tables.push(tableObject);
  //           });

  //           this.databaseInfo.databases.push(dbObject);

  //           // Store databaseInfo in local storage after all tables are fetched for the database
  //           localStorage.setItem(
  //             'databaseInfo',
  //             JSON.stringify(this.databaseInfo)
  //           );
  //           console.log(this.databaseInfo);
  //         });
  //       });
  //     });
  //   });
  // }
}
