import { Component } from '@angular/core';
import { DatabaseInfoService } from '../database-info.service';

@Component({
  selector: 'app-data-toolbar',
  templateUrl: './data-toolbar.component.html',
  styleUrl: './data-toolbar.component.css'
})
export class DataToolbarComponent {
  databaseInfo: any[] = [];

  constructor(private dbService: DatabaseInfoService) { }

  ngOnInit(): void {
    this.dbService.getDatabases().subscribe(databases => {
      databases.forEach(database => {
        const dbObject: any = {};
        dbObject[database] = {};

        this.dbService.getTables(database).subscribe(tables => {
          const tableDataPromises = tables.map(table => {
            return this.dbService.getTableData(database, table).toPromise();
          });

          Promise.all(tableDataPromises).then(tableDataArray => {
            tables.forEach((table, index) => {
              dbObject[database][table] = tableDataArray[index];
            });

            this.databaseInfo.push(dbObject);

            // Store databaseInfo in local storage after all tables are fetched for the database
            localStorage.setItem('databaseInfo', JSON.stringify(this.databaseInfo));
          });
        });
      });
    });
  }
}