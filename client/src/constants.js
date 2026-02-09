// List of all 36 Indian states and union territories
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep',
  'Delhi',
  'Puducherry',
  'Ladakh'
];

// Passport specific field schema
export const PASSPORT_FORM_STEPS = [
  {
    id: 'personal',
    title: 'Personal Information',
    icon: 'User',
    fields: [
      { name: 'firstName', label: 'First Name', type: 'text', required: true },
      { name: 'lastName', label: 'Last Name', type: 'text', required: true },
      { name: 'fatherName', label: "Father's Name", type: 'text', required: true },
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
      { name: 'maritalStatus', label: 'Marital Status', type: 'select', options: ['Single', 'Married', 'Divorced', 'Widowed'], required: true }
    ]
  },
  {
    id: 'address',
    title: 'Address Details',
    icon: 'MapPin',
    fields: [
      { name: 'address', label: 'Full Address', type: 'text', required: true },
      { name: 'city', label: 'City/Town', type: 'text', required: true },
      { name: 'pincode', label: 'PIN Code', type: 'text', required: true },
      { name: 'state', label: 'State', type: 'select', options: INDIAN_STATES, required: true }
    ]
  },
  {
    id: 'passport',
    title: 'Passport Details',
    icon: 'Shield',
    fields: [
      { name: 'passportType', label: 'Passport Type', type: 'select', options: ['New Passport', 'Renewal', 'Reissuance', 'Miscellaneous'], required: true },
      { name: 'occupation', label: 'Occupation', type: 'text', required: false },
      { name: 'oldPassportNumber', label: 'Old Passport Number (if renewal)', type: 'text', required: false }
    ]
  }
];

// Portal field selectors for auto-fill (supports multiple selector strategies)
export const PASSPORT_FIELD_SELECTORS = {
  firstName: ['#givenName', 'input[name="givenName"]', 'input[placeholder*="first name" i]', 'input[placeholder*="given name" i]'],
  lastName: ['#surname', '#lastName', 'input[name="surname"]', 'input[name="lastName"]', 'input[placeholder*="last name" i]'],
  fatherName: ['#fatherName', '#fathersName', 'input[name="fatherName"]', 'input[placeholder*="father" i]'],
  email: ['#email', '#emailAddress', 'input[name="email"]', 'input[type="email"]', 'input[placeholder*="email" i]'],
  mobile: ['#mobile', '#mobileNumber', '#phone', 'input[name="mobile"]', 'input[name="phone"]', 'input[type="tel"]', 'input[placeholder*="mobile" i]'],
  dob: ['#dob', '#dateOfBirth', 'input[name="dob"]', 'input[name="dateOfBirth"]', 'input[type="date"]', 'input[placeholder*="date of birth" i]'],
  gender: ['#gender', '#sex', 'select[name="gender"]', 'select[name="sex"]', 'input[name="gender"]'],
  maritalStatus: ['#maritalStatus', '#maritalStatuses', 'select[name="maritalStatus"]', 'input[name="maritalStatus"]', 'input[placeholder*="marital" i]'],
  address: ['#address', '#fullAddress', 'textarea[name="address"]', 'input[name="address"]', 'input[placeholder*="address" i]'],
  city: ['#city', '#cityName', 'input[name="city"]', 'input[placeholder*="city" i]'],
  pincode: ['#pincode', '#zipcode', '#postalCode', 'input[name="pincode"]', 'input[name="zipcode"]', 'input[placeholder*="pin" i]'],
  state: ['#state', '#stateCode', 'select[name="state"]', 'input[name="state"]', 'input[placeholder*="state" i]'],
  passportType: ['#passportType', '#type', 'select[name="passportType"]', 'input[name="passportType"]'],
  occupation: ['#occupation', 'input[name="occupation"]', 'input[placeholder*="occupation" i]'],
  oldPassportNumber: ['#oldPassportNumber', '#previousPassport', 'input[name="oldPassportNumber"]', 'input[placeholder*="old passport" i]']
};
