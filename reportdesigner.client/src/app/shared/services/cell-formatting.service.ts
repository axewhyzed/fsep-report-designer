import { Injectable } from '@angular/core';
import { DbFetchService } from './db-fetch.service';

@Injectable({
  providedIn: 'root'
})
export class CellFormattingService {
  databaseInfo: any = [];

  constructor() {
    const storedDatabaseInfo = localStorage.getItem('databaseInfo');
    if (storedDatabaseInfo) {
      this.databaseInfo = JSON.parse(storedDatabaseInfo);
      this.initializeCellFormatting();
    }
  }

  initializeCellFormatting(): void {
    let cellFormatting: { [key: string]: any } = {};

    for (const db of this.databaseInfo.databases) {
      for (const table of db.tables) {
        // Initialize cell formatting for table headers
        const headerKeys: string[] = Object.keys(table.data[0]); // Assuming the first row contains the headers
        for (
          let columnIndex = 0;
          columnIndex < headerKeys.length;
          columnIndex++
        ) {
          const headerKey = `-1|${db.name}-${table.name}-${headerKeys[columnIndex]}`;
          cellFormatting[headerKey] = {
            bold: true,
            italic: false,
            underline: false,
            strikethrough: false,
            fontSize: '16px',
            fontColor: '#000000',
            fontFamily: 'Times New Roman',
            backgroundColor: '#ffffff',
          };
        }

        // Initialize cell formatting for data rows
        for (let rowIndex = 0; rowIndex < table.data.length; rowIndex++) {
          const rowData = table.data[rowIndex];
          for (
            let columnIndex = 0;
            columnIndex < headerKeys.length;
            columnIndex++
          ) {
            const columnName = headerKeys[columnIndex];
            const cellKey = `${rowIndex}|${db.name}-${table.name}-${columnIndex}`;
            cellFormatting[cellKey] = {
              bold: false,
              italic: false,
              underline: false,
              strikethrough: false,
              fontSize: '16px',
              fontColor: '#000000',
              fontFamily: 'Times New Roman',
              backgroundColor: '#ffffff',
            };
          }
        }
      }
    }

    localStorage.setItem('cellFormatting', JSON.stringify(cellFormatting));
  }
}
