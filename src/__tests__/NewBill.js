/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import BillsUI from "../views/BillsUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import store from '../app/store';

import { ROUTES } from "../constants/routes.js";

jest.mock("../app/store", () => mockStore)


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    describe("When I add an image file as bill proof", () => {
      test("Then this new file should have been changed in the input", () => {
        Object.defineProperty(window, 'localStorage', {
          value: localStorageMock
        })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const html = NewBillUI()
        document.body.innerHTML = html

        const newBills = new NewBill({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage
        })

        const handleChangeFile = jest.fn((e) => newBills.handleChangeFile(e))
        const fileInput = screen.getByTestId('file')

        fileInput.addEventListener("change", handleChangeFile)
        fireEvent.change(fileInput, {
          target: {
            files: [new File(['bill.jpeg'], 'bill.jpeg', { type: 'image/jpeg' })]
          }
        })

        expect(handleChangeFile).toHaveBeenCalled()
        expect(fileInput.files[0].name).toBe('bill.jpeg')

        // add test error file 
        fileInput.addEventListener("change", handleChangeFile)
        fireEvent.change(fileInput, {
          target: {
            files: [new File(['test.pdf'], 'test.pdf', { type: 'application/pdf' })]
          }
        })

        expect(handleChangeFile).toHaveBeenCalled()
        expect(fileInput.files[0].name).toBe('test.pdf')
      })
    })

    describe('When I create a new bill', () => {
      test('Add bill to mock API POST', async () => {
        jest.spyOn(store, 'bills')
        jest.spyOn(store.bills(), "create")

        Object.defineProperty(window, 'localStorage', {
          value: localStorageMock
        })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const html = NewBillUI()
        document.body.innerHTML = html

        const newBills = new NewBill({
          document,
          onNavigate,
          firestore: null,
          localStorage: window.localStorage
        })

        // Init newBill
        const formData = new FormData();
        formData.append('file', new File(['bill.jpeg'], 'bill.jpeg', { type: 'image/jpeg' }));
        formData.append('email', 'employee@example.com');

        const billsCreate = jest.fn(() => store.bills().create({
          data: formData,
          headers: {
            noContentType: true
          }
        }));

        const handleSubmit = jest.fn((e) => newBills.handleSubmit)
        const newBillForm = screen.getByTestId('form-new-bill')
        newBillForm.addEventListener("submit", handleSubmit)

        fireEvent.submit(newBillForm)

        expect(handleSubmit).toHaveBeenCalled()

        /*mockStore.bills.mockImplementationOnce(() => {
          return {
            create: ({
              data: JSON.stringify(
                {
                  id: "BeKy5Mo4jkmdfPGYpTxZ",
                  vat: "",
                  amount: 100,
                  name: "test1",
                  fileName: "1592770761.jpeg",
                  commentary: "plop",
                  pct: 20,
                  type: "Transports",
                  email: "a@a",
                  fileUrl: "https://test.storage.tld/v0/b/billable-677b6.a…61.jpeg?alt=media&token=7685cd61-c112-42bc-9929-8a799bb82d8b",
                  date: "2001-01-01",
                  status: "refused",
                  commentAdmin: "en fait non"
                }
              )
            })
          }
        })*/


        /*mockStore.create({
          data: JSON.stringify(newBill),
          headers: {
            noContentType: true
          }
        })*/
        //const bills = await mockStore.create(newBill);

        // getSpyPost must have been called once
        //expect(getSpyPost).toHaveBeenCalledTimes(1);
        // The number of bills must be 5 
      });

      test('Add bill to API and fails with 404 message error', async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: () => {
              return Promise.reject(new Error('Erreur 404'))
            }
          }
        })

        // build user interface
        const html = BillsUI({
          error: 'Erreur 404'
        });
        document.body.innerHTML = html;

        const message = await screen.getByText(/Erreur 404/);
        // wait for the 404 error message
        expect(message).toBeTruthy();
      });

      test('Add bill to API and fails with 500 message error', async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: () => {
              return Promise.reject(new Error('Erreur 500'))
            }
          }
        })

        // build user interface
        const html = BillsUI({
          error: 'Erreur 500'
        });
        document.body.innerHTML = html;

        const message = await screen.getByText(/Erreur 500/);
        // wait for the 500 error message
        expect(message).toBeTruthy();
      });
    });

    describe("When I Submit form", () => {
      test("Then, I should be sent on Bills page", () => {
        Object.defineProperty(window, 'localStorage', {
          value: localStorageMock
        })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const html = NewBillUI()
        document.body.innerHTML = html

        const newBills = new NewBill({
          document,
          onNavigate,
          firestore: null,
          localStorage: window.localStorage
        })

        const handleSubmit = jest.fn((e) => newBills.handleSubmit)
        const newBillForm = screen.getByTestId('form-new-bill')
        newBillForm.addEventListener("submit", handleSubmit)

        fireEvent.submit(newBillForm)

        expect(handleSubmit).toHaveBeenCalled()
      })
    })
  })
})
