import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { ReportsService } from '../shared/services/reports.service';
import { Report } from '../shared/models/report.model';
import { ReportData } from '../shared/models/report-data.model';
import { ReportFormatting } from '../shared/models/report-formatting.model';
import { UpdateDataDto } from '../shared/models/update-data-dto.model';
import { flatMap, map, mergeMap } from 'rxjs';
import { ReportCustomization } from '../shared/models/report-customization.model';
import { CustomizeService } from '../shared/services/customize.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-design-view',
  templateUrl: './design-view.component.html',
  styleUrl: './design-view.component.css',
})
export class DesignViewComponent implements OnInit, AfterViewInit {
  reports: Report[] = [];
  reportDetails!: Report;
  reportData: ReportData[] = [];
  reportTitle: string = '';
  titleData: ReportData | undefined;
  selectedLogo: File | null = null;
  logoDataURL: string | null = null;
  showNewReportForm: boolean = false;
  showExistingReportForm: boolean = false;
  showReportContainer: boolean = false;
  numberOfTables: number = 0;
  tableSelectionRows: any[] = [];
  selectedDatabase: string = ''; // Holds the selected database
  selectedTables: string[] = []; // Holds the selected table
  selectedDatabaseTables: any[] = []; // Holds tables of the selected database
  // Define properties for headers and table data
  tableHeaders: ReportData[] = [];
  tableData: ReportData[][] = [];
  localCellFormatting: { [key: string]: ReportFormatting } = {};
  // Define a new variable to track updated cells
  updatedCells: Set<string> = new Set<string>();
  currentDateTime: string = '';
  footerText: string = 'Footer content here';

  constructor(
    private http: HttpClient,
    private router: Router,
    private reportsService: ReportsService,
    private customizeService: CustomizeService,
    private toastr: ToastrService
  ) { }

  variable1: string = '';
  variable2: string = '';

  // Initialize component data and fetch data if not already stored locally
  ngOnInit(): void {
    setInterval(() => {
      this.currentDateTime = new Date().toLocaleString();
    }, 1000);

    this.initializeClickOutsideListener();

    const ReportId = localStorage.getItem('selectedReportId');

    // Fetch all reports for the dropdown
    this.reportsService.getReports().subscribe(
      (data: Report[]) => {
        this.reports = data;
        if (ReportId) {
          this.getReportTitleData(this.selectedReportId);
        }
      },
      (error) => {
        console.error('Error fetching reports:', error);
      }
    );

    if (ReportId) {
      this.customizeService.headerBG$.subscribe(value => {
        this.reportCustomization.headerBGColor = value;
      });

      this.customizeService.footerBG$.subscribe(value => {
        this.reportCustomization.footerBGColor = value;
      });

      this.customizeService.bodyBG$.subscribe(value => {
        this.reportCustomization.bodyBGColor = value;
      });

      this.customizeService.tableBorder$.subscribe(value => {
        this.reportCustomization.tableBorderVisible = value;
      });

      this.customizeService.cellPadding$.subscribe(value => {
        this.reportCustomization.cellContentPadding = value;
      });

      this.customizeService.tablePadding$.subscribe(value => {
        this.reportCustomization.tableTopPadding = value;
      });

      this.customizeService.tableAlign$.subscribe(value => {
        this.reportCustomization.tableDataAlign = value;
      });

      this.customizeService.footerContent$.subscribe(value => {
        this.reportCustomization.footerContent = value;
      });

      // Subscribe to submitAction$ Observable
      this.customizeService.submitAction$.subscribe(() => {
        // Execute the function or update state in Component 2
        this.saveCustomization();
      });

      this.selectedReportId = JSON.parse(ReportId);
      this.showNewReportForm = false;
      this.showExistingReportForm = false;
      this.showReportContainer = true;

      const repDet = localStorage.getItem('reportDetails');
      if (repDet) {
        this.reportDetails = JSON.parse(repDet);
      } else {
        this.reportsService.getReport(this.selectedReportId).subscribe(
          (data: Report) => {
            this.reportDetails = data;
            localStorage.setItem(
              'reportDetails',
              JSON.stringify(this.reportDetails)
            );
          },
          (error) => {
            console.error('Error fetching report data:', error);
          }
        );
      }

      this.reportsService.getReportFormatting(this.selectedReportId).subscribe(
        (formatting: ReportFormatting[]) => {
          formatting.forEach((format: ReportFormatting) => {
            const key = `${format.reportID}|${format.dataID}`;
            this.localCellFormatting[key] = format;
          });
          // Once formatting data is fetched, store it in localStorage
          localStorage.setItem(
            'cellFormatting',
            JSON.stringify(this.localCellFormatting)
          );
          // localStorage.setItem(`reportFormatting_${this.selectedReportId}`, JSON.stringify(formatting));
        },
        (error) => {
          console.error('Error fetching report formatting:', error);
        }
      );

      this.fetchReportLogo();
      this.getReportCustomizationDetails(this.selectedReportId);
    }

    const updatedCellsJSON = localStorage.getItem('updatedCells');
    if (updatedCellsJSON) {
      this.updatedCells = new Set<string>(JSON.parse(updatedCellsJSON));
    }
  }

  ngAfterViewInit(): void {
    this.applyCustomization();
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: any) {
    if (this.updatedCells.size > 0) {
      event.returnValue = true; // Required for Chrome
      localStorage.removeItem('updatedCells');
    }
  }

  getReportTitleData(reportId: number): void {
    const report = this.reports.find((report) => report.reportID === reportId);
    if (report) {
      this.reportTitle = report.title;
    }
    this.reportsService.getReportData(this.selectedReportId).subscribe(
      (data: ReportData[]) => {
        this.reportData = data;
        this.tableHeaders = this.reportData.filter(
          (item) => item.rowIndex === 0
        );
        console.log(this.tableHeaders);
        this.tableData = this.groupDataByRows(
          this.reportData.filter(
            (item) => item.rowIndex !== 0 && item.isTitle !== true
          )
        );
        this.titleData = this.reportData.find(
          (data) => data.cellValue === this.reportTitle && data.isTitle
        );
        console.log(this.titleData);
      },
      (error) => {
        console.error('Error fetching report data:', error);
      }
    );
  }

  fetchReportLogo(): void {
    const reportId = this.selectedReportId;
    this.reportsService.getReportLogo(reportId).subscribe(
      (logoBlob: Blob) => {
        // Convert the logo blob to a data URL
        const reader = new FileReader();
        reader.readAsDataURL(logoBlob);
        reader.onloadend = () => {
          // Once the file is read, set the logoDataURL property
          this.logoDataURL = reader.result as string;
        };
      },
      (error) => {
        console.error('Error fetching report logo:', error);
      }
    );
  }

  saveFormatting(): void {
    const updatedCellKeys: string[] = Array.from(this.updatedCells);
    const updateDataDtos: UpdateDataDto[] = [];
    updatedCellKeys.forEach((cellKey) => {
      const [reportId, dataId] = cellKey.split('|');
      const reportIdNumber = parseInt(reportId, 10);
      const dataIdNumber = parseInt(dataId, 10);

      // Fetch cell formatting from localCellFormatting variable
      const cellFormatting = this.localCellFormatting[cellKey];

      // Construct the ReportFormatting object based on the fetched cell formatting
      const reportFormatting: ReportFormatting = {
        reportID: reportIdNumber,
        dataID: dataIdNumber,
        bold: cellFormatting.bold,
        italic: cellFormatting.italic,
        underline: cellFormatting.underline,
        strikethrough: cellFormatting.strikethrough,
        fontSize: cellFormatting.fontSize,
        fontFamily: cellFormatting.fontFamily,
        fontColor: cellFormatting.fontColor,
        backgroundColor: cellFormatting.backgroundColor,
      };

      // Create an UpdateDataDto object with reportFormatting
      const updateDataDto: UpdateDataDto = {
        reportFormatting,
      };

      // Push the updateDataDto object into the array
      updateDataDtos.push(updateDataDto);
    });

    // Call the updateReportFormatting method with the array of reportFormatting objects
    this.reportsService
      .updateReportFormatting(this.selectedReportId, updateDataDtos)
      .subscribe(
        (response) => {
          this.toastr.success('Changes Saved', '', {
            timeOut: 5000,
            easing: 'ease-in',
            easeTime: 300,
            progressBar: true,
            progressAnimation: 'decreasing'
          });
          console.log('Report formatting updated successfully');
          // Optionally, you can perform any actions after successful update
          this.updatedCells.clear();
          localStorage.setItem(
            'updatedCells',
            JSON.stringify(Array.from(this.updatedCells))
          );
        },
        (error) => {
          console.error('Error updating report formatting', error);
          // Optionally, handle the error
        }
      );
  }

  // Helper function to group data by rows
  private groupDataByRows(data: ReportData[]): ReportData[][] {
    const groupedData: ReportData[][] = [];
    data.forEach((item) => {
      if (!groupedData[item.rowIndex]) {
        groupedData[item.rowIndex] = [];
      }
      groupedData[item.rowIndex].push(item);
    });
    return groupedData.filter((row) => row.length > 0);
  }

  toggleReportWizard(modalName: string) {
    if (modalName === 'newReport') {
      this.showNewReportForm = !this.showNewReportForm;
    } else if (modalName === 'existingReport') {
      this.showExistingReportForm = !this.showExistingReportForm;
    }
  }

  reportCustomization!: ReportCustomization;

  getReportCustomizationDetails(reportID: number) {
    this.reportsService.getReportCustomization(reportID)
      .subscribe(
        (data: ReportCustomization) => {
          this.reportCustomization = data;
          console.log(data);
          // Apply the fetched customization to HTML elements
          this.applyCustomization();
        },
        error => {
          console.error('Error fetching report customization:', error);
        }
      );
  }

  applyCustomization() {
    // Apply fetched customization to HTML elements
    if (this.reportCustomization) {
      // Apply footer content
      this.footerText = this.reportCustomization.footerContent;
      console.log(this.footerText);
    }
  }

  saveCustomization() {
    this.reportsService.updateReportCustomization(this.selectedReportId, this.reportCustomization)
      .subscribe(
        response => {
          this.toastr.success('Customization Saved', '', {
            timeOut: 5000,
            easing: 'ease-in',
            easeTime: 300,
            progressBar: true,
            progressAnimation: 'decreasing'
          });
          // Handle success, if needed
        },
        error => {
          console.error('Error updating report customization:', error);
          // Handle error, if needed
        }
      );
  }

  searchTerm: string = '';
  searchResults: Report[] = [];
  isSearching: boolean = false;

  searchFunc(): void {
    if (this.searchTerm) {
      this.isSearching = true; // Set isSearching to true when performing a search
      this.reportsService.searchReports(this.searchTerm).subscribe(
        (reports: Report[]) => {
          this.searchResults = reports;
        },
        (error) => {
          console.error('Error searching reports:', error);
        }
      );
    } else {
      // Handle empty search term
      this.isSearching = false; // Set isSearching to false when the search term is empty
      this.searchResults = []; // Clear search results when search term is empty
    }
  }

  handleSearchChange(): void {
    this.isSearching = !!this.searchTerm.trim(); // Set isSearching based on whether the search term is empty
    if (this.isSearching) {
      this.searchFunc(); // Trigger search when there's text in the search box
    } else {
      this.searchResults = []; // Clear search results when the search box is empty
    }
  }

  selectedReportId!: number;

  selectReport(modalName: string, searchReportId: number) {
    localStorage.setItem('selectedReportId', searchReportId.toString());
    this.toggleReportWizard(modalName);
    this.showReportContainer = true;
    const reportData = {
      reportTitle: this.reportTitle,
      selectedLogo: this.selectedLogo,
      logoDataURL: this.logoDataURL,
    };
    localStorage.setItem('reportData', JSON.stringify(reportData));
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      window.location.reload();
    });
  }

  selectedApi: string = ''; // To store selected API
  apiData: any[] = []; // Array to store API data

  onChangeApi() {
    console.log(this.selectedApi);
    if (this.selectedApi === 'api1') {
      this.http
        .get<any[]>('https://jsonplaceholder.typicode.com/users')
        .subscribe(
          (data: any[]) => {
            this.apiData = data;
            this.formatDataSource(this.apiData);
          },
          (error) => {
            console.error('Error loading API 1 data:', error);
          }
        );
    } else if (this.selectedApi === 'api2') {
      this.http
        .get<any[]>('https://fakestoreapi.com/products?limit=10')
        .subscribe(
          (data: any[]) => {
            this.apiData = data;
            this.formatDataSource(this.apiData);
          },
          (error) => {
            console.error('Error loading API 2 data:', error);
          }
        );
    }
  }

  formatDataSource(apiData: any[]): ReportData[] {
    // Initialize an array to store the formatted report data
    const reportData: ReportData[] = [];
    const keysToExclude: string[] = [
      'rating',
      'image',
      'description',
      'address',
      'company',
      'phone',
    ];

    // Extract keys from the first object in the API data
    const keys = Object.keys(apiData[0]).filter(
      (key) => !keysToExclude.includes(key)
    );

    // Add keys as the first row (rowIndex 0)
    const headerRow: ReportData = {
      dataID: 0, // Auto generated by server
      reportID: 0, // Fetched from request parameters
      rowIndex: 0,
      columnIndex: 0,
      cellValue: '',
      isTitle: false, // Assuming the header row is a title
    };

    // Add keys as the first row (rowIndex 0)
    keys.forEach((key, index) => {
      headerRow.columnIndex = index;
      headerRow.cellValue = key;
      reportData.push({ ...headerRow });
    });

    // Iterate over each item in the API data
    apiData.forEach((item, itemIndex) => {
      // Skip the first row (header row)
      if (itemIndex >= 0) {
        // Iterate over each key and add it to the report data array
        keys.forEach((key, index) => {
          // Extract the value from the item using the key
          const cellValue = item[key];
          // Create an object with rowIndex, columnIndex, and cellValue
          const cellData = {
            dataID: 0, // Auto generated by server
            reportID: 0, // Fetched from request parameters
            rowIndex: itemIndex + 1,
            columnIndex: index,
            cellValue: String(cellValue),
            isTitle: false,
          };
          // Push the cellData object to the reportData array
          reportData.push(cellData);
        });
      }
    });
    // Add the report title as the last row
    const titleRow: ReportData = {
      dataID: 0, // Auto generated by server
      reportID: 0, // Fetched from request parameters
      rowIndex: -1,
      columnIndex: -1,
      cellValue: this.reportTitle,
      isTitle: true, // Indicate that this row is the title
    };
    reportData.push(titleRow);
    // Return the formatted report data
    console.log(reportData);
    return reportData;
  }

  submitReport(modalName: string) {
    if (modalName === 'existingReport') {
      // Log the submitted report title
      if (this.selectedReportId) {
        console.log('Submitted report title:', this.reportTitle);
        localStorage.setItem(
          'selectedReportId',
          this.selectedReportId.toString()
        );
        this.toggleReportWizard(modalName);
        this.showReportContainer = true;
        // Perform further actions, e.g., navigate to a different page or load the selected report
      }
      const reportData = {
        reportTitle: this.reportTitle,
        selectedLogo: this.selectedLogo,
        logoDataURL: this.logoDataURL,
      };
      localStorage.setItem('reportData', JSON.stringify(reportData));
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        window.location.reload();
      });
    } else if (modalName === 'newReport') {
      const newReport: Report = {
        reportID: 0, // Auto generated by Server
        title: this.reportTitle,
        logoImage: null,
      };

      this.reportsService
        .createReport(newReport, this.selectedLogo)
        .pipe(
          mergeMap((createdReport) => {
            console.log('Report created:', createdReport);
            this.selectedReportId = createdReport.reportID;
            const reportID = createdReport.reportID; // Extract reportID from the created report
            localStorage.setItem('selectedReportId', reportID.toString());

            const reportData: ReportData[] = this.formatDataSource(
              this.apiData
            );
            console.log(reportData);

            // Create report data
            return this.reportsService
              .createReportData(reportID, reportData)
              .pipe(
                mergeMap((createdData) => {
                  console.log('Report data created successfully:', createdData);

                  // Generate report formatting for each report data
                  const reportFormatting: ReportFormatting[] = createdData.map(
                    (data) => ({
                      dataID: data.dataID,
                      reportID: reportID, // Set bold to true only if rowIndex is 0
                      bold:
                        data.rowIndex === 0 ||
                        data.cellValue === this.reportTitle, // Example formatting, adjust as needed
                      italic: false,
                      underline: false,
                      strikethrough: false,
                      fontSize:
                        data.cellValue === this.reportTitle ? '24px' : '14px',
                      fontFamily: 'Arial',
                      fontColor: '#000000',
                      backgroundColor: data.cellValue === this.reportTitle ? '' : '',
                    })
                  );

                  // Create report formatting
                  return this.reportsService.createReportFormatting(
                    reportID,
                    reportFormatting
                  );
                })
              );
          }),
          mergeMap((reportID) => {
            // Add report customization
            const reportCustomization: ReportCustomization = {
              // Define your customization properties here
              reportID: 0,
              headerBGColor: '#FFFFFF',
              footerBGColor: '#FFFFFF',
              bodyBGColor: '#FFFFFF',
              tableBorderVisible: true,
              cellContentPadding: 5,
              tableTopPadding: 50,
              tableDataAlign: 'left',
              footerContent: 'Add text here',
            };
            return this.reportsService.addReportCustomization(this.selectedReportId, reportCustomization).pipe(
              map(() => reportID) // Pass reportID along the Observable chain
            );
          })
        )
        .subscribe(
          () => {
            console.log('Report created and data added successfully');
            this.router
              .navigateByUrl('/', { skipLocationChange: true })
              .then(() => {
                window.location.reload();
              });
            // Handle success, e.g., navigate to a different page or show a success message
            this.toggleReportWizard(modalName);
          },
          (error) => {
            console.error('Error creating report or report data:', error);
            // Handle error, e.g., show an error message to the user
          }
        );
    }
  }

  onLogoSelected(event: any) {
    this.selectedLogo = event.target.files?.[0];
    if (!this.selectedLogo) {
      alert('No Logo selected');
      return;
    }
    const maxSize = 1 * 1024 * 1024; // 5 MB max file size
    if (this.selectedLogo?.size > maxSize) {
      alert('Logo must be below 1 mb size');
      event.target.value = null;
      return;
    }
    this.loadLogoDataURL();
  }

  loadLogoDataURL() {
    if (this.selectedLogo) {
      const reader = new FileReader();
      reader.readAsDataURL(this.selectedLogo);
      reader.onload = () => {
        // Once the file is read, the result will be available as reader.result
        // We need to cast it to a string as FileReader.result is of type 'string | null'
        this.logoDataURL = reader.result as string;
        // Update logoImage field in reportDetails in local storage
        const storedReportDetails = localStorage.getItem('reportDetails');
        if (storedReportDetails) {
          const reportDetails = JSON.parse(storedReportDetails);
          reportDetails.logoImage = this.logoDataURL;
          localStorage.setItem('reportDetails', JSON.stringify(reportDetails));
        }
      };
    }
  }

  cancelReport(modalName: any) {
    // Close the report wizard without submitting
    this.toggleReportWizard(modalName);
    // Hide the report container if canceled
    this.showReportContainer = false;
    localStorage.removeItem('reportData');
  }

  // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
  //   window.location.reload();
  // })

  selectedCells: Set<string> = new Set<string>();

  getColumnHeader(index: number): string {
    // Add 65 to convert the index to ASCII code for A, B, C, etc.
    return String.fromCharCode(65 + index);
  }

  // Handle cell selection based on provided row index and column name
  toggleCellSelection(
    rowIndex: number | string,
    columnName: string | any
  ): void {
    const cellKey = `${rowIndex}|${columnName}`; // Unique identifier for the cell
    // For column-header
    if (columnName === 'column-header') {
      this.selectedCells.clear();
      // Adding the table header
      const colHeader = this.tableHeaders[rowIndex as number];
      this.selectedCells.add(`${colHeader.reportID}|${colHeader.dataID}`);
      for (const rowData of this.tableData) {
        const cell = rowData[rowIndex as number];
        const newCellKey = `${cell.reportID}|${cell.dataID}`;
        this.selectedCells.add(`${newCellKey}`);
      }
    }

    //For row-header
    else if (columnName === 'row-header') {
      this.selectedCells.clear();
      const rowData = this.tableData[rowIndex as number];
      for (const cell of rowData) {
        const newCellKey = `${cell.reportID}|${cell.dataID}`;
        console.log(newCellKey);
        this.selectedCells.add(`${newCellKey}`);
      }
    }

    else if (columnName === 'header-select') {
      this.selectedCells.clear();
      // Adding the table headers
      for (const colHeader of this.tableHeaders) {
        this.selectedCells.add(`${colHeader.reportID}|${colHeader.dataID}`);
      }
    }

    else if (columnName === 'corner-select') {
      this.selectedCells.clear();
      // Adding the table headers
      for (const colHeader of this.tableHeaders) {
        this.selectedCells.add(`${colHeader.reportID}|${colHeader.dataID}`);
      }
      // Adding all cells
      for (const rowData of this.tableData) {
        for (const cell of rowData) {
          const newCellKey = `${cell.reportID}|${cell.dataID}`;
          this.selectedCells.add(`${newCellKey}`);
        }
      }
    }
    else {
      // For normal cells
      console.log(cellKey);
      this.selectedCells.clear(); // Clear previous selections
      this.selectedCells.add(cellKey); // Select the clicked cell
    }
  }

  // Check if the cell at the provided row index and column name is selected
  isSelected(rowIndex: number, columnName: string | any): boolean {
    const cellKey = `${rowIndex}|${columnName}`;
    return this.selectedCells.has(cellKey);
  }

  @ViewChild('editableDiv') editableDiv!: ElementRef;

  clearSelectedCellsOutsideTable(event: MouseEvent): void {
    const isClickInsideTable = (event.target as HTMLElement).closest('.design-view-container');
    if (!isClickInsideTable) {
      this.selectedCells.clear(); // Clear selected cells if click is outside the table
    }
  }

  initializeClickOutsideListener(): void {
    document.body.addEventListener('click', this.clearSelectedCellsOutsideTable.bind(this));
  }

  // Function to check if a cell is a title cell or in the first row
  isSpecialCell(reportId: number, dataId: number): boolean {
    return this.reportData.some(
      (cell) =>
        cell.reportID === reportId &&
        cell.dataID === dataId &&
        (cell.rowIndex === 0 || cell.isTitle)
    );
  }

  // Toggle the specified text formatting
  toggleFormat(format: string): void {
    if (this.selectedCells.size === 0) return; // No cells selected

    // Create a set to store cell keys that need to be removed from updatedCells
    const keysToRemove: Set<string> = new Set<string>();
    // Update the formatting of the selected cell and the corresponding entry in the cellFormatting object
    this.selectedCells.forEach((cellKey) => {
      const [reportId, dataId] = cellKey.split('|');
      const reportIdNumber = parseInt(reportId, 10);
      const dataIdNumber = parseInt(dataId, 10);
      const cellFormattingKey = `${reportId}|${dataId}`;

      // // Check if the cell exists in localCellFormatting, if not, initialize it with default values
      // if (!this.localCellFormatting[cellFormattingKey]) {
      //   this.localCellFormatting[cellFormattingKey] = {
      //     dataID: dataIdNumber,
      //     reportID: reportIdNumber,
      //     bold: false,
      //     italic: false,
      //     underline: false,
      //     strikethrough: false,
      //     fontSize: '14px',
      //     fontFamily: 'Arial',
      //     fontColor: '#000000',
      //     backgroundColor: '#FFFFFF',
      //   };
      // }

      // Update the formatting based on the button clicked
      switch (format) {
        case 'bold':
          this.localCellFormatting[cellFormattingKey].bold =
            !this.localCellFormatting[cellFormattingKey].bold;
          this.applyFormatting(
            reportIdNumber,
            dataIdNumber,
            'fontWeight',
            this.localCellFormatting[cellFormattingKey].bold ? 'bold' : 'normal'
          );
          break;
        case 'italic':
          this.localCellFormatting[cellFormattingKey].italic =
            !this.localCellFormatting[cellFormattingKey].italic;
          this.applyFormatting(
            reportIdNumber,
            dataIdNumber,
            'fontStyle',
            this.localCellFormatting[cellFormattingKey].italic
              ? 'italic'
              : 'normal'
          );
          break;
        case 'underline':
          this.localCellFormatting[cellFormattingKey].underline =
            !this.localCellFormatting[cellFormattingKey].underline;
          if (this.localCellFormatting[cellFormattingKey].strikethrough) {
            // If strikethrough is active, concatenate underline with it
            this.applyFormatting(
              reportIdNumber,
              dataIdNumber,
              'textDecoration',
              this.localCellFormatting[cellFormattingKey].underline
                ? 'line-through underline'
                : 'line-through'
            );
          } else {
            // Otherwise, apply underline alone
            this.applyFormatting(
              reportIdNumber,
              dataIdNumber,
              'textDecoration',
              this.localCellFormatting[cellFormattingKey].underline
                ? 'underline'
                : 'none'
            );
          }
          break;
        case 'strikethrough':
          this.localCellFormatting[cellFormattingKey].strikethrough =
            !this.localCellFormatting[cellFormattingKey].strikethrough;
          if (this.localCellFormatting[cellFormattingKey].underline) {
            // If underline is active, concatenate strikethrough with it
            this.applyFormatting(
              reportIdNumber,
              dataIdNumber,
              'textDecoration',
              this.localCellFormatting[cellFormattingKey].strikethrough
                ? 'line-through underline'
                : 'underline'
            );
          } else {
            // Otherwise, apply strikethrough alone
            this.applyFormatting(
              reportIdNumber,
              dataIdNumber,
              'textDecoration',
              this.localCellFormatting[cellFormattingKey].strikethrough
                ? 'line-through'
                : 'none'
            );
          }
          break;
      }

      // If the formatting is reverted back to normal, add the cell key to keysToRemove set
      if (
        !this.isSpecialCell(reportIdNumber, dataIdNumber) &&
        this.isDefaultStyle(this.localCellFormatting[cellFormattingKey])
      ) {
        keysToRemove.add(cellFormattingKey);
      }
      this.updatedCells.add(cellFormattingKey);
    });

    // Remove cell keys from updatedCells set
    keysToRemove.forEach((key) => {
      this.updatedCells.delete(key);
    });

    localStorage.setItem(
      'cellFormatting',
      JSON.stringify(this.localCellFormatting)
    );
    localStorage.setItem(
      'updatedCells',
      JSON.stringify(Array.from(this.updatedCells))
    );
  }

  removeFormatting(): void {
    if (this.selectedCells.size === 0) return; // No cells selected

    // Create a set to store cell keys that need to be removed from updatedCells
    const keysToRemove: Set<string> = new Set<string>();

    // Loop through selected cells and reset formatting to initial state
    this.selectedCells.forEach((cellKey) => {
      const [reportId, dataId] = cellKey.split('|');
      const reportIdNumber = parseInt(reportId, 10);
      const dataIdNumber = parseInt(dataId, 10);
      const cellFormattingKey = `${reportId}|${dataId}`;

      // Reset formatting to initial state
      const initialFormatting = {
        dataID: dataIdNumber,
        reportID: reportIdNumber,
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        fontSize: '14px',
        fontColor: '#000000',
        fontFamily: 'Arial',
        backgroundColor: '',
      };

      // Check if rowIndex is 0 or isTitle is true
      if (
        this.reportData.some(
          (cell) =>
            cell.reportID === reportIdNumber &&
            cell.dataID === dataIdNumber &&
            cell.rowIndex === 0
        )
      ) {
        initialFormatting.bold = true; // Keep bold true if rowIndex is 0
      }

      const isTitleCell = this.reportData.some(
        (cell) =>
          cell.reportID === reportIdNumber &&
          cell.dataID === dataIdNumber &&
          cell.isTitle
      );
      if (isTitleCell) {
        initialFormatting.fontSize = '24px'; // Set font size to 24 if it's a title cell
        initialFormatting.bold = true; // Keep bold true if it's a title cell
      }

      // Reset formatting to initial state
      this.localCellFormatting[cellFormattingKey] = initialFormatting;

      // Apply the initial formatting to the cell
      this.applyFormatting(
        reportIdNumber,
        dataIdNumber,
        'fontWeight',
        initialFormatting.bold ? 'bold' : 'normal'
      );
      this.applyFormatting(reportIdNumber, dataIdNumber, 'fontStyle', 'normal');
      this.applyFormatting(
        reportIdNumber,
        dataIdNumber,
        'textDecoration',
        'none'
      );
      this.applyFormatting(
        reportIdNumber,
        dataIdNumber,
        'fontSize',
        initialFormatting.fontSize
      );
      this.applyFormatting(
        reportIdNumber,
        dataIdNumber,
        'color',
        initialFormatting.fontColor
      );
      this.applyFormatting(
        reportIdNumber,
        dataIdNumber,
        'fontFamily',
        initialFormatting.fontFamily
      );
      this.applyFormatting(
        reportIdNumber,
        dataIdNumber,
        'backgroundColor',
        initialFormatting.backgroundColor
      );
      this.updatedCells.add(cellFormattingKey);
    });

    // Save the updated cell formatting to local storage
    localStorage.setItem(
      'cellFormatting',
      JSON.stringify(this.localCellFormatting)
    );
    localStorage.setItem(
      'updatedCells',
      JSON.stringify(Array.from(this.updatedCells))
    );
  }

  applyStyle(cellReportId: number, cellDataId: number | any) {
    const defaultStyle = {
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      fontSize: '14px',
      fontColor: '#000000',
      fontFamily: 'Arial',
      backgroundColor: '',
      border: this.reportCustomization.tableBorderVisible ? '1px solid black' : 'none',
      padding: this.reportCustomization.cellContentPadding
        ? this.reportCustomization.cellContentPadding + 'px'
        : '0',
    };

    // Retrieve cellFormatting from localStorage
    const cellFormatting = localStorage.getItem('cellFormatting');
    if (cellFormatting) {
      const cellKey = `${cellReportId}|${cellDataId}`;
      const formatting = JSON.parse(cellFormatting)[cellKey];

      // Check if the style in cellFormatting differs from default style
      if (formatting && !this.isDefaultStyle(formatting)) {
        const style: any = {
          border: this.reportCustomization.tableBorderVisible ? '1px solid black' : 'none',
          padding: this.reportCustomization.cellContentPadding
            ? this.reportCustomization.cellContentPadding + 'px'
            : '0',
        };

        if (formatting.bold) style['font-weight'] = 'bold';
        if (formatting.italic) style['font-style'] = 'italic';
        if (formatting.underline) style['text-decoration'] = 'underline';
        if (formatting.strikethrough)
          style['text-decoration-line'] = 'line-through';
        style['font-size'] = formatting.fontSize;
        style.color = formatting.fontColor;
        style['font-family'] = formatting.fontFamily;
        style['background-color'] = formatting.backgroundColor;
        if (this.titleData?.dataID === cellDataId) {
          style['border'] = 'none';
          style['padding'] = '0';
          return style;
        }

        return style;
      }
    }
    return defaultStyle; // Default empty style object
  }

  // Function to check if a style is default
  isDefaultStyle(style: any) {
    const defaultStyle = {
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      fontSize: '14px',
      fontColor: '#000000',
      fontFamily: 'Arial',
      backgroundColor: '',
    };
    // List of properties to ignore during comparison
    const ignoreProperties = ['reportID', 'dataID'];

    for (const key in defaultStyle) {
      if (defaultStyle.hasOwnProperty(key) && !ignoreProperties.includes(key)) {
        if ((style as any)[key] !== (defaultStyle as any)[key]) {
          return false;
        }
      }
    }

    return true;
  }

  // Apply formatting to the selected cell in localStorage
  applyFormatting(
    rowIndex: number,
    columnName: number,
    property: keyof CSSStyleDeclaration,
    value: string
  ): void {
    const selectedCell = document.querySelector(
      '.selected-cell'
    ) as HTMLTableCellElement;
    if (selectedCell) {
      selectedCell.style[property as any] = value;
    }
  }

  // Change the text color to the specified color
  changeTextColor(txtcolor: string): void {
    // Create a set to store cell keys that need to be removed from updatedCells
    const keysToRemove: Set<string> = new Set<string>();

    this.selectedCells.forEach((cellKey) => {
      const [reportId, dataId] = cellKey.split('|');
      const reportIdNumber = parseInt(reportId, 10);
      const dataIdNumber = parseInt(dataId, 10);
      const cellFormattingKey = `${reportId}|${dataId}`;

      if (!this.localCellFormatting[cellFormattingKey]) {
        this.localCellFormatting[cellFormattingKey] = {
          dataID: dataIdNumber,
          reportID: reportIdNumber,
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          fontSize: '14px',
          fontFamily: 'Arial',
          fontColor: '#000000',
          backgroundColor: '',
        };
      }

      // Update the fontColor property of the cellFormatting
      this.localCellFormatting[cellFormattingKey].fontColor = txtcolor;
      localStorage.setItem(
        'cellFormatting',
        JSON.stringify(this.localCellFormatting)
      );
      console.log(txtcolor);

      if (this.isDefaultStyle(this.localCellFormatting[cellFormattingKey])) {
        keysToRemove.add(cellFormattingKey);
      }
      this.updatedCells.add(cellFormattingKey);
    });

    // Remove cell keys from updatedCells set
    keysToRemove.forEach((key) => {
      this.updatedCells.delete(key);
    });

    localStorage.setItem(
      'cellFormatting',
      JSON.stringify(this.localCellFormatting)
    );
    localStorage.setItem(
      'updatedCells',
      JSON.stringify(Array.from(this.updatedCells))
    );
  }

  // Change the background color to the specified color
  changeBackgroundColor(bgfcolor: string): void {
    // Create a set to store cell keys that need to be removed from updatedCells
    const keysToRemove: Set<string> = new Set<string>();

    this.selectedCells.forEach((cellKey) => {
      const [reportId, dataId] = cellKey.split('|');
      const reportIdNumber = parseInt(reportId, 10);
      const dataIdNumber = parseInt(dataId, 10);
      const cellFormattingKey = `${reportId}|${dataId}`;

      if (!this.localCellFormatting[cellFormattingKey]) {
        this.localCellFormatting[cellFormattingKey] = {
          dataID: dataIdNumber,
          reportID: reportIdNumber,
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          fontSize: '14px',
          fontFamily: 'Arial',
          fontColor: '#000000',
          backgroundColor: '',
        };
      }

      this.localCellFormatting[cellFormattingKey].backgroundColor = bgfcolor;
      localStorage.setItem(
        'cellFormatting',
        JSON.stringify(this.localCellFormatting)
      );
      console.log(bgfcolor);
      if (this.isDefaultStyle(this.localCellFormatting[cellFormattingKey])) {
        keysToRemove.add(cellFormattingKey);
      }
      this.updatedCells.add(cellFormattingKey);
    });

    // Remove cell keys from updatedCells set
    keysToRemove.forEach((key) => {
      this.updatedCells.delete(key);
    });

    localStorage.setItem(
      'cellFormatting',
      JSON.stringify(this.localCellFormatting)
    );
    localStorage.setItem(
      'updatedCells',
      JSON.stringify(Array.from(this.updatedCells))
    );
  }

  // Change the font size to the specified size
  changeFontSize(fontSize: string): void {
    // Create a set to store cell keys that need to be removed from updatedCells
    const keysToRemove: Set<string> = new Set<string>();

    this.selectedCells.forEach((cellKey) => {
      const [reportId, dataId] = cellKey.split('|');
      const reportIdNumber = parseInt(reportId, 10);
      const dataIdNumber = parseInt(dataId, 10);
      const cellFormattingKey = `${reportId}|${dataId}`;

      if (!this.localCellFormatting[cellFormattingKey]) {
        this.localCellFormatting[cellFormattingKey] = {
          dataID: dataIdNumber,
          reportID: reportIdNumber,
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          fontSize: '14px',
          fontFamily: 'Arial',
          fontColor: '#000000',
          backgroundColor: '',
        };
      }

      this.localCellFormatting[cellFormattingKey].fontSize = fontSize;
      localStorage.setItem(
        'cellFormatting',
        JSON.stringify(this.localCellFormatting)
      );
      console.log(fontSize);
      if (this.isDefaultStyle(this.localCellFormatting[cellFormattingKey])) {
        keysToRemove.add(cellFormattingKey);
      }
      this.updatedCells.add(cellFormattingKey);
    });

    // Remove cell keys from updatedCells set
    keysToRemove.forEach((key) => {
      this.updatedCells.delete(key);
    });

    localStorage.setItem(
      'cellFormatting',
      JSON.stringify(this.localCellFormatting)
    );
    localStorage.setItem(
      'updatedCells',
      JSON.stringify(Array.from(this.updatedCells))
    );
    // document.execCommand('fontSize', false, fontSize);
  }

  // Change the font family to the specified font
  changeFontFamily(fontFamily: string): void {
    // Create a set to store cell keys that need to be removed from updatedCells
    const keysToRemove: Set<string> = new Set<string>();

    this.selectedCells.forEach((cellKey) => {
      const [reportId, dataId] = cellKey.split('|');
      const reportIdNumber = parseInt(reportId, 10);
      const dataIdNumber = parseInt(dataId, 10);
      const cellFormattingKey = `${reportId}|${dataId}`;

      if (!this.localCellFormatting[cellFormattingKey]) {
        this.localCellFormatting[cellFormattingKey] = {
          dataID: dataIdNumber,
          reportID: reportIdNumber,
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          fontSize: '14px',
          fontFamily: 'Arial',
          fontColor: '#000000',
          backgroundColor: '',
        };
      }

      this.localCellFormatting[cellFormattingKey].fontFamily = fontFamily;
      localStorage.setItem(
        'cellFormatting',
        JSON.stringify(this.localCellFormatting)
      );
      console.log(fontFamily);
      if (this.isDefaultStyle(this.localCellFormatting[cellFormattingKey])) {
        keysToRemove.add(cellFormattingKey);
      }
      this.updatedCells.add(cellFormattingKey);
    });

    // Remove cell keys from updatedCells set
    keysToRemove.forEach((key) => {
      this.updatedCells.delete(key);
    });

    localStorage.setItem(
      'cellFormatting',
      JSON.stringify(this.localCellFormatting)
    );
    localStorage.setItem(
      'updatedCells',
      JSON.stringify(Array.from(this.updatedCells))
    );
    // document.execCommand('fontName', false, fontFamily);
  }

  // updateCellStyle(property: keyof CSSStyleDeclaration, value: string): void {
  //   if (this.selectedCells.size === 0) return; // No cells selected

  //   this.selectedCells.forEach((cellKey) => {
  //     const [rowIndex, columnName] = cellKey.split('_');
  //     const rowIndexNumber = parseInt(rowIndex, 10);
  //     const cellFormattingKey = `${rowIndex}_${columnName}`;

  //     // Update localCellFormatting
  //     this.localCellFormatting[cellFormattingKey][property] = value;
  //   });

  //   // Save the updated cell formatting to local storage
  //   localStorage.setItem('cellFormatting', JSON.stringify(this.localCellFormatting));

  //   // Apply formatting to the selected cells
  //   this.selectedCells.forEach((cellKey) => {
  //     const [rowIndex, columnName] = cellKey.split('_');
  //     this.applyFormatting(parseInt(rowIndex, 10), columnName, property, value);
  //   });
  // }

  // changeTextColor(color: string): void {
  //   this.updateCellStyle('fontColor', color);
  // }

  // changeBackgroundColor(color: string): void {
  //   this.updateCellStyle('backgroundColor', color);
  // }

  // changeFontSize(fontSize: string): void {
  //   this.updateCellStyle('fontSize', fontSize);
  // }

  // changeFontFamily(fontFamily: string): void {
  //   this.updateCellStyle('fontFamily', fontFamily);
  // }
}
