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
import router from "../app/Router.js";


import { ROUTES, ROUTES_PATH } from "../constants/routes.js";

jest.mock("../app/store", () => mockStore)

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}


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
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }))

        const html = NewBillUI()
        document.body.innerHTML = html

        const newBills = new NewBill({
          document,
          onNavigate,
          firestore: null,
          localStorage: window.localStorage
        })

        const inputData = {
          expense_name: "Admin",
          date: "2019-08-21",
          amount: "100",
          vat: "20",
          pct: "20",
          commentary: "commentaire dépense",
          file: [new File(['bill.jpeg'], 'bill.jpeg', { type: 'image/jpeg' })],
        };

        const inputExpenseName = screen.getByTestId("expense-name");
        fireEvent.change(inputExpenseName, { target: { value: inputData.expense_name } });
        expect(inputExpenseName.value).toBe(inputData.expense_name);

        const inputDate = screen.getByTestId("datepicker");
        fireEvent.change(inputDate, {
          target: { value: inputData.date },
        });
        expect(inputDate.value).toBe(inputData.date);

        const inputAmount = screen.getByTestId("amount");
        fireEvent.change(inputAmount, {
          target: { value: inputData.amount },
        });
        expect(inputAmount.value).toBe(inputData.amount);

        const inputVat = screen.getByTestId("vat");
        fireEvent.change(inputVat, {
          target: { value: inputData.vat },
        });
        expect(inputVat.value).toBe(inputData.vat);

        const inputPct = screen.getByTestId("pct");
        fireEvent.change(inputPct, {
          target: { value: inputData.pct },
        });
        expect(inputPct.value).toBe(inputData.pct);

        const inputCommentary = screen.getByTestId("commentary");
        fireEvent.change(inputCommentary, {
          target: { value: inputData.commentary },
        });
        expect(inputCommentary.value).toBe(inputData.commentary);

        console.log(inputData.file[0]);
        const inputFile = screen.getByTestId("file");
        fireEvent.change(inputFile, {
          target: { files: inputData.file },
        });
        expect(inputFile.files).toBe(inputData.file);

        const handleSubmit = jest.fn((e) => newBills.handleSubmit)
        const newBillForm = screen.getByTestId('form-new-bill')
        newBillForm.addEventListener("submit", handleSubmit)
        fireEvent.submit(newBillForm)

        expect(window.location.pathname).toBe('/')
        expect(window.location.hash).toBe(ROUTES_PATH.Bills)
        expect(store.bills).toHaveBeenCalled()
        //        expect(handleSubmit).toHaveBeenCalled()
      });

      test.skip('Then the file type is checked on change', () => {
        Object.defineProperty(window, 'localStorage', {
          value: localStorageMock
        })
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
        document.body.innerHTML = NewBillUI()

        const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage })
        const imgMock = new File(['(⌐□_□)'], 'file.jpg', { type: 'image/jpg' })
        const badImgMock = new File(['(⌐□_□)'], 'file.pdf', { type: 'application/pdf' })
        const fileInput = screen.getByTestId('file')
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))

        fileInput.addEventListener('change', handleChangeFile)
        fireEvent.change(fileInput, { target: { files: [imgMock] } })
        expect(handleChangeFile).not.toHaveReturnedWith(true)

        fireEvent.change(fileInput, { target: { files: [badImgMock] } })
        expect(handleChangeFile).toHaveReturnedWith(false)
        expect(handleChangeFile).toHaveBeenCalled()
      })

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
