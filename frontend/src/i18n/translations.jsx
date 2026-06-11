import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    common: {
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      actions: "Actions",
      search: "Search...",
      loading: "Loading...",
      success: "Success",
      error: "Error",
      name: "Name",
      phone: "Phone",
      address: "Address",
      theme: "Theme",
      appearance: "Appearance",
      signOut: "Sign Out",
      portalLogin: "Portal Login"
    },
    nav: {
      dashboard: "Dashboard",
      stock: "Stock",
      sell: "Sell",
      invoices: "Invoices",
      providers: "Providers"
    },
    dashboard: {
      title: "Dashboard",
      subtitle: "Real-time pharmacy metrics & performance.",
      inventoryValue: "Total Inventory Value",
      totalProducts: "Total Products",
      lowStock: "Low Stock",
      todaySales: "Today's Sales",
      transactionsCount: "{{count}} transaction recorded today",
      transactionsCountPlural: "{{count}} transactions recorded today",
      suppliers: "Suppliers & Providers",
      quickOps: "Quick Operations",
      newSale: "New Sale",
      addStockItem: "Add Stock Item",
      failedLoad: "Failed to load dashboard metrics.",
      checkServer: "Please check if the Laravel API server is running."
    },
    stock: {
      title: "Stock Management",
      subtitle: "Monitor inventory levels, add new stock, and upload product images.",
      searchPlaceholder: "Search stock items...",
      addNewItem: "Add New Item",
      editItem: "Edit Stock Item",
      manageCategories: "Manage Categories",
      categoryManager: {
        title: "Manage Categories",
        addPlaceholder: "New category name",
        deleteWarningTitle: "Delete Category: {{name}}?",
        deleteWarningDesc: "This category is linked to the following products:",
        deleteWarningInfo: "Deleting this category will remove it from these products. Products with other categories will retain them. Products with only this category will have it cleared (blank category). The products themselves will NOT be deleted.",
        confirmDeleteBtn: "Yes, Delete Category",
        emptyCategories: "No categories created yet."
      },
      table: {
        item: "Item",
        category: "Categories",
        provider: "Provider",
        boxes: "Boxes",
        pcsPerBox: "Pcs/Box",
        totalPcs: "Total Pcs",
        unitPrice: "Unit Price",
        actions: "Actions"
      },
      form: {
        itemName: "Item Name",
        itemCode: "Item Code",
        description: "Description",
        image: "Product Image",
        boxesQty: "Boxes Qty",
        pcsPerBox: "Pcs per Box",
        unitPrice: "Unit Price (៛)",
        categorySelect: "Select Category",
        providerSelect: "Select Provider",
        imageUploadHint: "Click to upload product image",
        creating: "Creating...",
        saving: "Saving..."
      }
    },
    sell: {
      title: "Point of Sale (POS)",
      subtitle: "Select products, manage cart items, and generate buyer invoices.",
      buyerInfo: "Buyer Info",
      walkIn: "Walk-in Buyer",
      knownBuyer: "Known Buyer",
      searchBuyer: "Search past buyers...",
      categoryFilterAll: "All Categories",
      searchItems: "Search items...",
      stock: "Stock",
      inStock: "In stock",
      outOfStock: "Out of stock",
      cart: "Cart Panel",
      emptyCart: "Your cart is empty. Add products from the grid.",
      subtotal: "Subtotal",
      grandTotal: "Grand Total",
      generateInvoice: "Generate Invoice",
      generatingInvoice: "Generating...",
      successModal: {
        title: "Invoice Generated Successfully!",
        viewInvoice: "View Invoice",
        printInvoice: "Print Invoice",
        close: "Close"
      },
      quantitySelect: {
        title: "Select Quantity",
        box: "Box",
        pcs: "Pcs",
        available: "Available",
        addToCart: "Add to Cart"
      }
    },
    invoices: {
      title: "Invoice History",
      subtitle: "View and print past sales invoices.",
      searchPlaceholder: "Search by buyer or invoice #...",
      table: {
        invoiceNum: "Invoice #",
        date: "Date",
        buyer: "Buyer Name",
        phone: "Buyer Phone",
        total: "Total Amount",
        actions: "Actions"
      },
      view: "View"
    },
    invoice: {
      print: "Print / Save PDF",
      back: "Back to POS",
      title: "INVOICE",
      number: "Invoice #",
      date: "Date",
      buyer: "Buyer Name",
      phone: "Buyer Phone",
      table: {
        item: "Item Name",
        qty: "Qty (boxes/pcs)",
        unitPrice: "Unit Price",
        subtotal: "Subtotal"
      },
      grandTotal: "Grand Total",
      scanToPay: "Scan to Pay (ABA Bank)"
    },
    providers: {
      title: "Providers & Suppliers",
      subtitle: "Manage wholesale medicine distributors and linked stock counts.",
      addNewProvider: "Add New Provider",
      editProvider: "Edit Provider",
      table: {
        name: "Provider Name",
        phone: "Phone Number",
        address: "Address",
        itemsCount: "Linked Items",
        actions: "Actions"
      },
      form: {
        name: "Provider Name",
        phone: "Phone Number",
        address: "Address",
        saving: "Saving..."
      },
      detail: {
        viewItems: "View Items",
        hideItems: "Hide Items",
        noItems: "No items linked to this provider yet.",
        reassignProvider: "Reassign Provider",
        reassignHint: "Move this item to a different provider",
        totalStockValue: "Total Stock Value",
        boxes: "boxes",
        pcsPerBox: "pcs/box"
      }
    }
  },
  kh: {
    common: {
      save: "រក្សាទុក",
      cancel: "បោះបង់",
      edit: "កែប្រែ",
      delete: "លុប",
      actions: "សកម្មភាព",
      search: "ស្វែងរក...",
      loading: "កំពុងផ្ទុក...",
      success: "ជោគជ័យ",
      error: "កំហុស",
      name: "ឈ្មោះ",
      phone: "លេខទូរស័ព្ទ",
      address: "អាសយដ្ឋាន",
      theme: "ស្បែក",
      appearance: "រូបរាង",
      signOut: "ចាកចេញ",
      portalLogin: "ចូលប្រព័ន្ធ"
    },
    nav: {
      dashboard: "ផ្ទាំងគ្រប់គ្រង",
      stock: "ស្តុកទំនិញ",
      sell: "លក់ទំនិញ",
      invoices: "វិក្កយបត្រ",
      providers: "អ្នកផ្គត់ផ្គង់"
    },
    dashboard: {
      title: "ផ្ទាំងគ្រប់គ្រង",
      subtitle: "ស្ថិតិ និងដំណើរការលក់ឱសថស្ថានក្នុងពេលជាក់ស្តែង។",
      inventoryValue: "តម្លៃស្តុកសរុប",
      totalProducts: "ផលិតផលសរុប",
      lowStock: "ស្តុកទាប",
      todaySales: "ការលក់ថ្ងៃនេះ",
      transactionsCount: "ថ្ងៃនេះលក់បាន {{count}} ប្រតិបត្តិការ",
      transactionsCountPlural: "ថ្ងៃនេះលក់បាន {{count}} ប្រតិបត្តិការ",
      suppliers: "អ្នកផ្គត់ផ្គង់ & ដៃគូ",
      quickOps: "ប្រតិបត្តិការរហ័ស",
      newSale: "លក់ថ្មី",
      addStockItem: "បន្ថែមទំនិញស្តុក",
      failedLoad: "បរាជ័យក្នុងការទាញយកទិន្នន័យផ្ទាំងគ្រប់គ្រង។",
      checkServer: "សូមពិនិត្យមើលថាតើម៉ាស៊ីនបម្រើ API Laravel កំពុងដំណើរការឬទេ។"
    },
    stock: {
      title: "ការគ្រប់គ្រងស្តុក",
      subtitle: "ពិនិត្យមើលកម្រិតស្តុក បន្ថែមស្តុកថ្មី និងផ្ទុកឡើងរូបភាពផលិតផល។",
      searchPlaceholder: "ស្វែងរកទំនិញក្នុងស្តុក...",
      addNewItem: "បន្ថែមទំនិញថ្មី",
      editItem: "កែប្រែទំនិញស្តុក",
      manageCategories: "គ្រប់គ្រងប្រភេទ",
      categoryManager: {
        title: "គ្រប់គ្រងប្រភេទផលិតផល",
        addPlaceholder: "ឈ្មោះប្រភេទថ្មី",
        deleteWarningTitle: "លុបប្រភេទ៖ {{name}}?",
        deleteWarningDesc: "ប្រភេទនេះត្រូវបានភ្ជាប់ទៅនឹងផលិតផលដូចខាងក្រោម៖",
        deleteWarningInfo: "ការលុបប្រភេទនេះនឹងដកវាចេញពីផលិតផលទាំងនេះ។ ផលិតផលដែលមានប្រភេទផ្សេងទៀតនឹងរក្សាទុកប្រភេទទាំងនោះ។ ផលិតផលដែលមានតែប្រភេទនេះមួយគត់ នឹងត្រូវកំណត់ទៅជាទទេ (គ្មានប្រភេទ)។ ផលិតផលទាំងនោះនឹងមិនត្រូវបានលុបឡើយ។",
        confirmDeleteBtn: "បាទ/ចាស លុបប្រភេទនេះ",
        emptyCategories: "មិនទាន់មានប្រភេទផលិតផលនៅឡើយទេ។"
      },
      table: {
        item: "ទំនិញ",
        category: "ប្រភេទ",
        provider: "អ្នកផ្គត់ផ្គង់",
        boxes: "ប្រអប់",
        pcsPerBox: "គ្រាប់/ប្រអប់",
        totalPcs: "ចំនួនគ្រាប់សរុប",
        unitPrice: "តម្លៃរាយ",
        actions: "សកម្មភាព"
      },
      form: {
        itemName: "ឈ្មោះទំនិញ",
        itemCode: "កូដទំនិញ",
        description: "ការពិពណ៌នា",
        image: "រូបភាពផលិតផល",
        boxesQty: "ចំនួនប្រអប់",
        pcsPerBox: "ចំនួនគ្រាប់ក្នុងមួយប្រអប់",
        unitPrice: "តម្លៃរាយ (៛)",
        categorySelect: "ជ្រើសរើសប្រភេទ",
        providerSelect: "ជ្រើសរើសអ្នកផ្គត់ផ្គង់",
        imageUploadHint: "ចុចដើម្បីផ្ទុកឡើងរូបភាពផលិតផល",
        creating: "កំពុងបង្កើត...",
        saving: "កំពុងរក្សាទុក..."
      }
    },
    sell: {
      title: "កន្លែងលក់ទំនិញ (POS)",
      subtitle: "ជ្រើសរើសផលិតផល គ្រប់គ្រងកន្ត្រកទំនិញ និងបង្កើតវិក្កយបត្រជូនអ្នកទិញ។",
      buyerInfo: "ព័ត៌មានអ្នកទិញ",
      walkIn: "ភ្ញៀវទូទៅ",
      knownBuyer: "ភ្ញៀវស្គាល់",
      searchBuyer: "ស្វែងរកឈ្មោះអ្នកទិញ...",
      categoryFilterAll: "គ្រប់ប្រភេទ",
      searchItems: "ស្វែងរកទំនិញ...",
      stock: "ស្តុក",
      inStock: "មានក្នុងស្តុក",
      outOfStock: "អស់ពីស្តុក",
      cart: "បញ្ជីទំនិញលក់",
      emptyCart: "កន្ត្រកទំនិញទទេ មិនទាន់មានទំនិញនៅឡើយទេ។",
      subtotal: "សរុបរង",
      grandTotal: "សរុបរួម",
      generateInvoice: "ចេញវិក្កយបត្រ",
      generatingInvoice: "កំពុងដំណើរការ...",
      successModal: {
        title: "បានបង្កើតវិក្កយបត្រដោយជោគជ័យ!",
        viewInvoice: "មើលវិក្កយបត្រ",
        printInvoice: "បោះពុម្ភវិក្កយបត្រ",
        close: "បិទ"
      },
      quantitySelect: {
        title: "ជ្រើសរើសចំនួនលក់",
        box: "ប្រអប់",
        pcs: "គ្រាប់",
        available: "ចំនួនដែលមាន",
        addToCart: "បន្ថែមទៅកន្ត្រក"
      }
    },
    invoices: {
      title: "ប្រវត្តិនៃការលក់",
      subtitle: "មើល និងបោះពុម្ភវិក្កយបត្រលក់កន្លងមក។",
      searchPlaceholder: "ស្វែងរកតាមឈ្មោះអ្នកទិញ ឬលេខវិក្កយបត្រ...",
      table: {
        invoiceNum: "លេខវិក្កយបត្រ",
        date: "កាលបរិច្ឆេទ",
        buyer: "ឈ្មោះអ្នកទិញ",
        phone: "លេខទូរស័ព្ទ",
        total: "ទឹកប្រាក់សរុប",
        actions: "សកម្មភាព"
      },
      view: "បង្ហាញ"
    },
    invoice: {
      print: "បោះពុម្ភ / រក្សាទុកជា PDF",
      back: "ត្រឡប់ទៅលក់វិញ",
      title: "វិក្កយបត្រ",
      number: "លេខវិក្កយបត្រ",
      date: "កាលបរិច្ឆេទ",
      buyer: "ឈ្មោះអ្នកទិញ",
      phone: "លេខទូរស័ព្ទ",
      table: {
        item: "ឈ្មោះទំនិញ",
        qty: "ចំនួន (ប្រអប់/គ្រាប់)",
        unitPrice: "តម្លៃឯកតា",
        subtotal: "សរុបរង"
      },
      grandTotal: "សរុបរួម",
      scanToPay: "ស្កេនដើម្បីទូទាត់ប្រាក់ (ធនាគារ ABA)"
    },
    providers: {
      title: "អ្នកផ្គត់ផ្គង់ និងចែកចាយ",
      subtitle: "គ្រប់គ្រងក្រុមហ៊ុនចែកចាយឱសថបោះដុំ និងចំនួនទំនិញដែលបានភ្ជាប់។",
      addNewProvider: "បន្ថែមអ្នកផ្គត់ផ្គង់ថ្មី",
      editProvider: "កែប្រែអ្នកផ្គត់ផ្គង់",
      table: {
        name: "ឈ្មោះអ្នកផ្គត់ផ្គង់",
        phone: "លេខទូរស័ព្ទ",
        address: "អាសយដ្ឋាន",
        itemsCount: "ទំនិញពាក់ព័ន្ធ",
        actions: "សកម្មភាព"
      },
      form: {
        name: "ឈ្មោះអ្នកផ្គត់ផ្គង់",
        phone: "លេខទូរស័ព្ទ",
        address: "អាសយដ្ឋាន",
        saving: "កំពុងរក្សាទុក..."
      },
      detail: {
        viewItems: "មើលទំនិញ",
        hideItems: "បិទទំនិញ",
        noItems: "មិនទាន់មានទំនិញភ្ជាប់ទៅអ្នកផ្គត់ផ្គង់នេះទេ។",
        reassignProvider: "ផ្លាស់ប្តូរអ្នកផ្គត់ផ្គង់",
        reassignHint: "ផ្លាស់ប្តូរទំនិញនេះទៅអ្នកផ្គត់ផ្គង់ផ្សេង",
        totalStockValue: "តម្លៃស្តុកសរុប",
        boxes: "ប្រអប់",
        pcsPerBox: "គ្រាប់/ប្រអប់"
      }
    }
  }
};

// Formatter for Cambodian Riel (៛)
export function formatCurrency(value) {
  const num = parseFloat(value) || 0;
  return new Intl.NumberFormat('kh-KH', {
    style: 'decimal',
    maximumFractionDigits: 0
  }).format(num) + ' ៛';
}

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang === 'kh' ? 'km' : 'en';
    if (lang === 'kh') {
      document.documentElement.classList.add('font-khmer');
    } else {
      document.documentElement.classList.remove('font-khmer');
    }
  }, [lang]);

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let translation = translations[lang];
    
    for (const k of keys) {
      if (translation && translation[k] !== undefined) {
        translation = translation[k];
      } else {
        // Fallback to English
        let fallback = translations['en'];
        for (const fk of keys) {
          if (fallback && fallback[fk] !== undefined) {
            fallback = fallback[fk];
          } else {
            return key;
          }
        }
        translation = fallback;
        break;
      }
    }

    if (typeof translation === 'string') {
      let result = translation;
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramVal));
      });
      return result;
    }
    
    return key;
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'kh' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
