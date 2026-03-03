import { useState } from "react";

// Step metadata for sidebar + header
const steps = [
  { id: 1, label: "Account" },
  { id: 2, label: "Application Type" },
  { id: 3, label: "Personal Info" },
  { id: 4, label: "Family Details" },
  { id: 5, label: "Address" },
  { id: 6, label: "Emergency Contact" },
  { id: 7, label: "Previous Doc" },
  { id: 8, label: "Other Info" },
  { id: 9, label: "Review" },
  { id: 10, label: "Payment" },
  { id: 11, label: "Appointment" },
  { id: 12, label: "Confirmation" },
];

// Utility mapping from internal data keys to the \"passport\" field
// keys used by the main Formitra app and the extension selectors.
// This lets us pre-fill the mock portal when extension drives it.
const MOCK_PORTAL_FIELD_MAP = {
  givenName: 'givenName',
  surname: 'lastName',
  fatherGivenName: 'fatherName',
  email: 'email',
  mobile: 'mobile',
  dob: 'dob',
  gender: 'gender',
  maritalStatus: 'maritalStatus',
  address: 'address',
  village: 'city',
  pincode: 'pincode',
  state2: 'state',
  passportType: 'passportType',
  employment: 'occupation',
  prevPassportNo: 'oldPassportNumber',
};

const InputField = ({ label, type = "text", name, value, onChange, required, placeholder, readOnly }) => (
  <div style={{ marginBottom: "16px" }}>
    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#4a5568", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {label} {required && <span style={{ color: "#e53e3e" }}>*</span>}
    </label>
    <input
      type={type}
      name={name}
      id={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      style={{
        width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0",
        borderRadius: "8px", fontSize: "14px", color: "#2d3748",
        background: readOnly ? "#f7fafc" : "#fff", boxSizing: "border-box",
        outline: "none", transition: "border 0.2s",
        fontFamily: "inherit"
      }}
      onFocus={e => !readOnly && (e.target.style.border = "1.5px solid #3182ce")}
      onBlur={e => (e.target.style.border = "1.5px solid #e2e8f0")}
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, required }) => (
  <div style={{ marginBottom: "16px" }}>
    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#4a5568", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {label} {required && <span style={{ color: "#e53e3e" }}>*</span>}
    </label>
    <select
      name={name}
      id={name}
      value={value || ""}
      onChange={onChange}
      style={{
        width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0",
        borderRadius: "8px", fontSize: "14px", color: "#2d3748",
        background: "#fff", boxSizing: "border-box", outline: "none",
        fontFamily: "inherit", cursor: "pointer"
      }}
    >
      <option value="">-- Select --</option>
      {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
    </select>
  </div>
);

const RadioGroup = ({ label, name, value, onChange, options }) => (
  <div style={{ marginBottom: "16px" }}>
    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#4a5568", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
      {options.map(o => (
        <label key={o} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", color: "#2d3748" }}>
          <input type="radio" name={name} value={o} checked={value === o} onChange={onChange} style={{ accentColor: "#3182ce" }} />
          {o}
        </label>
      ))}
    </div>
  </div>
);

const SectionTitle = ({ children }) => (
  <div style={{ borderLeft: "4px solid #3182ce", paddingLeft: "12px", marginBottom: "20px", marginTop: "8px" }}>
    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#2b6cb0" }}>{children}</h3>
  </div>
);

const Alert = ({ type, children }) => {
  const colors = {
    info: { bg: "#ebf8ff", border: "#3182ce", text: "#2c5282" },
    success: { bg: "#f0fff4", border: "#38a169", text: "#276749" },
    warning: { bg: "#fffbeb", border: "#d69e2e", text: "#744210" },
  };
  const c = colors[type] || colors.info;
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", color: c.text, fontSize: "13px", lineHeight: "1.5" }}>
      {children}
    </div>
  );
};

const Btn = ({ children, onClick, variant = "primary", disabled, style: extra, dataTestId }) => {
  const styles = {
    primary: { background: "#2b6cb0", color: "#fff", border: "none" },
    secondary: { background: "#edf2f7", color: "#4a5568", border: "1px solid #cbd5e0" },
    success: { background: "#276749", color: "#fff", border: "none" },
    danger: { background: "#c53030", color: "#fff", border: "none" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={dataTestId}
      style={{
        ...styles[variant], padding: "11px 24px", borderRadius: "8px",
        fontSize: "14px", fontWeight: "600", cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1, fontFamily: "inherit", transition: "opacity 0.2s",
        ...extra
      }}
    >
      {children}
    </button>
  );
};

// ─── STEP COMPONENTS ────────────────────────────────────────────────────────

function StepAccount({ data, setData, next }) {
  const [mode, setMode] = useState("register");
  const upd = e => setData(p => ({ ...p, [e.target.name]: e.target.value }));

  if (mode === "login") return (
    <div>
      <SectionTitle>Sign In to CitiDoc Portal</SectionTitle>
      <Alert type="info">Use your registered email and password to continue an existing application or schedule an appointment.</Alert>
      <InputField label="Registered Email" name="email" value={data.email} onChange={upd} required placeholder="email@example.com" />
      <InputField label="Password" type="password" name="password" value={data.password} onChange={upd} required placeholder="Enter password" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
        <Btn onClick={next} dataTestId="mock-next">Sign In & Continue</Btn>
        <span style={{ fontSize: "13px", color: "#4a5568", cursor: "pointer", textDecoration: "underline" }} onClick={() => setMode("register")}>New user? Register</span>
      </div>
    </div>
  );

  return (
    <div>
      <SectionTitle>Create New Account</SectionTitle>
      <Alert type="info">Register to begin a new travel document application. You'll receive updates and appointment notifications at your email.</Alert>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <InputField label="Given Name" name="givenName" value={data.givenName} onChange={upd} required placeholder="First name" />
        <InputField label="Surname" name="surname" value={data.surname} onChange={upd} required placeholder="Last name" />
      </div>
      <InputField label="Email Address" name="email" value={data.email} onChange={upd} required type="email" placeholder="your@email.com" />
      <InputField label="Mobile Number" name="mobile" value={data.mobile} onChange={upd} required placeholder="10-digit mobile" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <InputField label="Password" name="password" type="password" value={data.password} onChange={upd} required placeholder="Min. 8 characters" />
        <InputField label="Confirm Password" name="confirmPwd" type="password" value={data.confirmPwd} onChange={upd} required placeholder="Repeat password" />
      </div>
      <InputField label="Date of Birth" name="dob" type="date" value={data.dob} onChange={upd} required />
      <SelectField label="State of Residence" name="state" value={data.state} onChange={upd} required
        options={["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Puducherry","Chandigarh"]}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
        <Btn onClick={next} dataTestId="mock-next">Register & Proceed</Btn>
        <span style={{ fontSize: "13px", color: "#4a5568", cursor: "pointer", textDecoration: "underline" }} onClick={() => setMode("login")}>Already registered? Sign In</span>
      </div>
    </div>
  );
}

function StepAppType({ data, setData, next, prev }) {
  const upd = e => setData(p => ({ ...p, [e.target.name]: e.target.value }));

  const AppCard = ({ type, icon, desc, selected, onClick }) => (
    <div onClick={onClick} style={{
      border: selected ? "2px solid #2b6cb0" : "2px solid #e2e8f0",
      borderRadius: "12px", padding: "20px", cursor: "pointer",
      background: selected ? "#ebf8ff" : "#fff", transition: "all 0.2s",
      marginBottom: "12px"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "24px" }}>{icon}</span>
        <div>
          <div style={{ fontWeight: "700", fontSize: "15px", color: "#2d3748" }}>{type}</div>
          <div style={{ fontSize: "13px", color: "#718096", marginTop: "2px" }}>{desc}</div>
        </div>
        {selected && <span style={{ marginLeft: "auto", color: "#2b6cb0", fontSize: "20px" }}>✓</span>}
      </div>
    </div>
  );

  return (
    <div>
      <SectionTitle>Type of Application</SectionTitle>
      <Alert type="info">Select the application type that best describes your requirement. Processing fees and timelines vary by type.</Alert>

      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#4a5568", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Application Category <span style={{ color: "#e53e3e" }}>*</span></label>
      {[
        { type: "Fresh Passport", icon: "🆕", desc: "Applying for a travel document for the first time" },
        { type: "Re-issue of Passport", icon: "🔄", desc: "Renewal, change in particulars, damaged or lost passport" },
      ].map(a => (
        <AppCard key={a.type} {...a} selected={data.appType === a.type}
          onClick={() => setData(p => ({ ...p, appType: a.type }))} />
      ))}

      {data.appType === "Re-issue of Passport" && (
        <SelectField label="Reason for Re-issue" name="reissueReason" value={data.reissueReason} onChange={upd}
          options={["Expiry of validity","Change in existing particulars","Exhaustion of pages","Lost passport","Damaged passport"]}
        />
      )}

      <SelectField label="Passport Booklet Type" name="bookletType" value={data.bookletType} onChange={upd} required
        options={[{ value: "36", label: "Normal (36 pages)" }, { value: "60", label: "Jumbo (60 pages)" }]}
      />
      <SelectField label="Validity Required" name="validity" value={data.validity} onChange={upd} required
        options={[{ value: "10", label: "10 Years" }, { value: "5", label: "5 Years (Minors under 15)" }]}
      />
      <RadioGroup label="Service Type" name="serviceType" value={data.serviceType} onChange={upd}
        options={["Normal (30 working days)", "Tatkaal (3 working days)"]}
      />

      {data.serviceType?.includes("Tatkaal") && (
        <Alert type="warning">⚡ Tatkaal service attracts an additional fee of ₹2,000 over regular charges. Ensure eligibility before selecting.</Alert>
      )}

      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
        <Btn variant="secondary" onClick={prev} dataTestId="mock-prev">← Back</Btn>
        <Btn onClick={next} disabled={!data.appType || !data.bookletType || !data.validity || !data.serviceType} dataTestId="mock-next">Next →</Btn>
      </div>
    </div>
  );
}

function StepPersonal({ data, setData, next, prev }) {
  const upd = e => setData(p => ({ ...p, [e.target.name]: e.target.value }));
  return (
    <div>
      <SectionTitle>Personal Information</SectionTitle>
      <Alert type="info">Enter details exactly as they appear on your official identity documents (Aadhaar, PAN, Birth Certificate).</Alert>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
        <InputField label="Given Name" name="givenName" value={data.givenName} onChange={upd} required />
        <InputField label="Surname" name="surname" value={data.surname} onChange={upd} required />
        <SelectField label="Name Alias" name="alias" value={data.alias} onChange={upd} options={["No Alias", "Has Alias/Known Name"]} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <RadioGroup label="Gender" name="gender" value={data.gender} onChange={upd} options={["Male", "Female", "Transgender"]} />
        <RadioGroup label="Marital Status" name="maritalStatus" value={data.maritalStatus} onChange={upd} options={["Single", "Married", "Divorced", "Widowed"]} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
        <InputField label="Date of Birth" name="dob" type="date" value={data.dob} onChange={upd} required />
        <InputField label="Place of Birth" name="pob" value={data.pob} onChange={upd} required placeholder="City" />
        <SelectField label="State of Birth" name="sob" value={data.sob} onChange={upd} required
          options={["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Born Outside India"]}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <SelectField label="Citizenship Type" name="citizenshipType" value={data.citizenshipType} onChange={upd} required
          options={["By Birth", "By Descent", "By Registration", "By Naturalisation"]}
        />
        <InputField label="PAN Card Number" name="pan" value={data.pan} onChange={upd} placeholder="ABCDE1234F (if applicable)" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <InputField label="Voter ID Number" name="voterId" value={data.voterId} onChange={upd} placeholder="Optional" />
        <InputField label="Aadhaar Number" name="aadhaar" value={data.aadhaar} onChange={upd} placeholder="12-digit number" />
      </div>
      <InputField label="Employment Type" name="employment" value={data.employment} onChange={upd} placeholder="e.g. Private Sector, Government, Self-Employed, Student, Retired" />
      <InputField label="Educational Qualification" name="education" value={data.education} onChange={upd} placeholder="e.g. Graduate, Post-Graduate, Below 10th, 10th Pass" />

      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
        <Btn variant="secondary" onClick={prev} dataTestId="mock-prev">← Back</Btn>
        <Btn onClick={next} dataTestId="mock-next">Next →</Btn>
      </div>
    </div>
  );
}

function StepFamily({ data, setData, next, prev }) {
  const upd = e => setData(p => ({ ...p, [e.target.name]: e.target.value }));
  return (
    <div>
      <SectionTitle>Family Details</SectionTitle>
      <Alert type="info">Details of your parents/guardians are required. For married applicants, spouse details are also required.</Alert>

      <div style={{ background: "#f7fafc", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
        <div style={{ fontWeight: "700", color: "#2d3748", marginBottom: "12px", fontSize: "14px" }}>Father's Details</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <InputField label="Father's Given Name" name="fatherGivenName" value={data.fatherGivenName} onChange={upd} required />
          <InputField label="Father's Surname" name="fatherSurname" value={data.fatherSurname} onChange={upd} required />
        </div>
        <RadioGroup label="Is father a passport holder?" name="fatherPassport" value={data.fatherPassport} onChange={upd} options={["Yes", "No"]} />
        {data.fatherPassport === "Yes" && <InputField label="Father's Passport Number" name="fatherPassportNo" value={data.fatherPassportNo} onChange={upd} />}
      </div>

      <div style={{ background: "#f7fafc", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
        <div style={{ fontWeight: "700", color: "#2d3748", marginBottom: "12px", fontSize: "14px" }}>Mother's Details</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <InputField label="Mother's Given Name" name="motherGivenName" value={data.motherGivenName} onChange={upd} required />
          <InputField label="Mother's Surname" name="motherSurname" value={data.motherSurname} onChange={upd} required />
        </div>
        <RadioGroup label="Is mother a passport holder?" name="motherPassport" value={data.motherPassport} onChange={upd} options={["Yes", "No"]} />
        {data.motherPassport === "Yes" && <InputField label="Mother's Passport Number" name="motherPassportNo" value={data.motherPassportNo} onChange={upd} />}
      </div>

      {data.maritalStatus === "Married" && (
        <div style={{ background: "#f7fafc", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
          <div style={{ fontWeight: "700", color: "#2d3748", marginBottom: "12px", fontSize: "14px" }}>Spouse's Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <InputField label="Spouse's Given Name" name="spouseGivenName" value={data.spouseGivenName} onChange={upd} />
            <InputField label="Spouse's Surname" name="spouseSurname" value={data.spouseSurname} onChange={upd} />
          </div>
          <RadioGroup label="Is spouse a passport holder?" name="spousePassport" value={data.spousePassport} onChange={upd} options={["Yes", "No"]} />
          {data.spousePassport === "Yes" && <InputField label="Spouse's Passport Number" name="spousePassportNo" value={data.spousePassportNo} onChange={upd} />}
          <InputField label="Spouse's Nationality" name="spouseNationality" value={data.spouseNationality} onChange={upd} placeholder="e.g. Indian" />
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
        <Btn variant="secondary" onClick={prev} dataTestId="mock-prev">← Back</Btn>
        <Btn onClick={next} dataTestId="mock-next">Next →</Btn>
      </div>
    </div>
  );
}

function StepAddress({ data, setData, next, prev }) {
  const upd = e => setData(p => ({ ...p, [e.target.name]: e.target.value }));
  const [sameAsPermanent, setSame] = useState(false);

  const copyAddress = (checked) => {
    setSame(checked);
    if (checked) {
      setData(p => ({
        ...p,
        permaHouse: p.house, permaStreet: p.street, permaVillage: p.village,
        permaDistrict: p.district, permaState: p.state2, permaPincode: p.pincode
      }));
    }
  };

  return (
    <div>
      <SectionTitle>Present Residential Address</SectionTitle>
      <Alert type="info">Address must match your address proof document. Police verification will be done at this address.</Alert>

      <div style={{ background: "#f7fafc", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
        <div style={{ fontWeight: "700", color: "#2d3748", marginBottom: "12px", fontSize: "14px" }}>Present Address</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <InputField label="House / Flat / Door No." name="house" value={data.house} onChange={upd} required />
          <InputField label="Street / Lane / Road Name" name="street" value={data.street} onChange={upd} required />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
          <InputField label="Village / Town / City" name="village" value={data.village} onChange={upd} required />
          <InputField label="District" name="district" value={data.district} onChange={upd} required />
          <InputField label="Pincode" name="pincode" value={data.pincode} onChange={upd} required placeholder="6-digit" />
        </div>
        <SelectField label="State / Union Territory" name="state2" value={data.state2} onChange={upd} required
          options={["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Puducherry","Chandigarh"]}
        />
        <InputField label="Mobile Number (for updates)" name="addrMobile" value={data.addrMobile} onChange={upd} required placeholder="10-digit number" />
        <InputField label="Telephone Number (STD code + number)" name="telephone" value={data.telephone} onChange={upd} placeholder="Optional" />
        <InputField label="Email Address" name="addrEmail" value={data.addrEmail} onChange={upd} placeholder="Optional" />
      </div>

      <div style={{ background: "#f7fafc", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ fontWeight: "700", color: "#2d3748", fontSize: "14px" }}>Permanent Address</div>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#4a5568", cursor: "pointer" }}>
            <input type="checkbox" checked={sameAsPermanent} onChange={e => copyAddress(e.target.checked)} style={{ accentColor: "#3182ce" }} />
            Same as present address
          </label>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <InputField label="House / Flat / Door No." name="permaHouse" value={data.permaHouse} onChange={upd} />
          <InputField label="Street / Lane / Road Name" name="permaStreet" value={data.permaStreet} onChange={upd} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
          <InputField label="Village / Town / City" name="permaVillage" value={data.permaVillage} onChange={upd} />
          <InputField label="District" name="permaDistrict" value={data.permaDistrict} onChange={upd} />
          <InputField label="Pincode" name="permaPincode" value={data.permaPincode} onChange={upd} placeholder="6-digit" />
        </div>
        <SelectField label="State / Union Territory" name="permaState" value={data.permaState} onChange={upd}
          options={["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Puducherry","Chandigarh"]}
        />
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
        <Btn variant="secondary" onClick={prev} dataTestId="mock-prev">← Back</Btn>
        <Btn onClick={next} dataTestId="mock-next">Next →</Btn>
      </div>
    </div>
  );
}

function StepEmergency({ data, setData, next, prev }) {
  const upd = e => setData(p => ({ ...p, [e.target.name]: e.target.value }));
  return (
    <div>
      <SectionTitle>Emergency Contact & References</SectionTitle>
      <Alert type="info">Provide details of a person residing in India who can be contacted in an emergency situation.</Alert>

      <div style={{ background: "#f7fafc", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
        <div style={{ fontWeight: "700", color: "#2d3748", marginBottom: "12px", fontSize: "14px" }}>Emergency Contact Person</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <InputField label="Name" name="emergencyName" value={data.emergencyName} onChange={upd} required />
          <InputField label="Relationship" name="emergencyRelation" value={data.emergencyRelation} onChange={upd} required placeholder="e.g. Spouse, Parent, Sibling" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <InputField label="Mobile Number" name="emergencyMobile" value={data.emergencyMobile} onChange={upd} required placeholder="10-digit" />
          <InputField label="Email Address" name="emergencyEmail" value={data.emergencyEmail} onChange={upd} placeholder="Optional" />
        </div>
        <InputField label="Complete Address" name="emergencyAddress" value={data.emergencyAddress} onChange={upd} required placeholder="Full address with pincode" />
      </div>

      <div style={{ background: "#f7fafc", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
        <div style={{ fontWeight: "700", color: "#2d3748", marginBottom: "12px", fontSize: "14px" }}>Reference 1</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <InputField label="Name" name="ref1Name" value={data.ref1Name} onChange={upd} required />
          <InputField label="Mobile Number" name="ref1Mobile" value={data.ref1Mobile} onChange={upd} required placeholder="10-digit" />
        </div>
        <InputField label="Complete Address" name="ref1Address" value={data.ref1Address} onChange={upd} placeholder="Full address" />
      </div>

      <div style={{ background: "#f7fafc", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
        <div style={{ fontWeight: "700", color: "#2d3748", marginBottom: "12px", fontSize: "14px" }}>Reference 2</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <InputField label="Name" name="ref2Name" value={data.ref2Name} onChange={upd} />
          <InputField label="Mobile Number" name="ref2Mobile" value={data.ref2Mobile} onChange={upd} placeholder="10-digit" />
        </div>
        <InputField label="Complete Address" name="ref2Address" value={data.ref2Address} onChange={upd} placeholder="Full address" />
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
        <Btn variant="secondary" onClick={prev} dataTestId="mock-prev">← Back</Btn>
        <Btn onClick={next} dataTestId="mock-next">Next →</Btn>
      </div>
    </div>
  );
}

function StepPreviousDoc({ data, setData, next, prev }) {
  const upd = e => setData(p => ({ ...p, [e.target.name]: e.target.value }));
  return (
    <div>
      <SectionTitle>Previous Travel Document Details</SectionTitle>
      <Alert type="info">If you have never held a travel document, select "No" below and proceed.</Alert>

      <RadioGroup label="Have you ever held a travel document (passport)?" name="hadPassport" value={data.hadPassport} onChange={upd} options={["Yes", "No"]} />

      {data.hadPassport === "Yes" && (
        <div style={{ background: "#f7fafc", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <InputField label="Previous Passport Number" name="prevPassportNo" value={data.prevPassportNo} onChange={upd} required />
            <InputField label="Date of Issue" name="prevIssueDate" type="date" value={data.prevIssueDate} onChange={upd} required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <InputField label="Date of Expiry" name="prevExpiryDate" type="date" value={data.prevExpiryDate} onChange={upd} required />
            <InputField label="Place of Issue" name="prevIssuePlace" value={data.prevIssuePlace} onChange={upd} required placeholder="e.g. New Delhi" />
          </div>
          <RadioGroup label="Passport Status" name="prevPassportStatus" value={data.prevPassportStatus} onChange={upd}
            options={["In Possession", "Lost", "Damaged"]}
          />
          {data.prevPassportStatus === "Lost" && (
            <div>
              <InputField label="Date of Reporting FIR" name="firDate" type="date" value={data.firDate} onChange={upd} />
              <InputField label="FIR Number" name="firNo" value={data.firNo} onChange={upd} placeholder="Police station FIR reference" />
              <InputField label="Police Station" name="policeStation" value={data.policeStation} onChange={upd} />
            </div>
          )}
        </div>
      )}

      <RadioGroup label="Have you ever applied for and been refused a passport?" name="passportRefused" value={data.passportRefused} onChange={upd} options={["Yes", "No"]} />
      {data.passportRefused === "Yes" && <InputField label="Reason for Refusal" name="refusalReason" value={data.refusalReason} onChange={upd} />}

      <RadioGroup label="Have you held any other nationality passport?" name="otherNationality" value={data.otherNationality} onChange={upd} options={["Yes", "No"]} />
      {data.otherNationality === "Yes" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <InputField label="Nationality" name="otherNationName" value={data.otherNationName} onChange={upd} />
          <InputField label="Passport Number" name="otherNationPassport" value={data.otherNationPassport} onChange={upd} />
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
        <Btn variant="secondary" onClick={prev} dataTestId="mock-prev">← Back</Btn>
        <Btn onClick={next} dataTestId="mock-next">Next →</Btn>
      </div>
    </div>
  );
}

function StepOtherInfo({ data, setData, next, prev }) {
  const upd = e => setData(p => ({ ...p, [e.target.name]: e.target.value }));
  const questions = [
    { key: "q1", label: "Have you ever been convicted by a court of law in India or abroad?" },
    { key: "q2", label: "Are there any criminal proceedings pending against you in any court in India or abroad?" },
    { key: "q3", label: "Were you ever arrested, detained, or deported from any country?" },
    { key: "q4", label: "Have you ever been refused a visa to any country?" },
    { key: "q5", label: "Have you ever renounced Indian citizenship or held a foreign citizenship?" },
    { key: "q6", label: "Are you a government servant?" },
    { key: "q7", label: "Were you ever repatriated to India at the expense of the Government of India?" },
  ];

  return (
    <div>
      <SectionTitle>Other Information & Declarations</SectionTitle>
      <Alert type="warning">⚠️ Please answer all questions truthfully. Providing false information is a punishable offense under the Passports Act, 1967.</Alert>

      {questions.map(q => (
        <div key={q.key} style={{ background: "#f7fafc", borderRadius: "8px", padding: "14px 16px", marginBottom: "12px" }}>
          <div style={{ fontSize: "13px", color: "#4a5568", marginBottom: "8px" }}>{q.label}</div>
          <RadioGroup label="" name={q.key} value={data[q.key]} onChange={upd} options={["Yes", "No"]} />
          {data[q.key] === "Yes" && <InputField label="Please provide details" name={`${q.key}Details`} value={data[`${q.key}Details`]} onChange={upd} />}
        </div>
      ))}

      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
        <Btn variant="secondary" onClick={prev}>← Back</Btn>
        <Btn onClick={next}>Next →</Btn>
      </div>
    </div>
  );
}

function StepReview({ data, next, prev }) {
  const Row = ({ label, value }) => value ? (
    <div style={{ display: "flex", borderBottom: "1px solid #edf2f7", padding: "8px 0" }}>
      <div style={{ width: "40%", fontSize: "12px", color: "#718096", fontWeight: "600", textTransform: "uppercase" }}>{label}</div>
      <div style={{ width: "60%", fontSize: "14px", color: "#2d3748" }}>{value}</div>
    </div>
  ) : null;

  const Section = ({ title, children }) => (
    <div style={{ background: "#f7fafc", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
      <div style={{ fontWeight: "700", color: "#2b6cb0", marginBottom: "12px", fontSize: "14px", borderBottom: "2px solid #bee3f8", paddingBottom: "6px" }}>{title}</div>
      {children}
    </div>
  );

  return (
    <div>
      <SectionTitle>Review Your Application</SectionTitle>
      <Alert type="warning">⚠️ Please verify all details carefully before submitting. Incorrect information may lead to rejection or legal action.</Alert>

      <Section title="Application Details">
        <Row label="Application Type" value={data.appType} />
        <Row label="Service Type" value={data.serviceType} />
        <Row label="Booklet Type" value={`${data.bookletType} pages`} />
        <Row label="Validity" value={`${data.validity} years`} />
      </Section>

      <Section title="Personal Information">
        <Row label="Full Name" value={`${data.givenName || ""} ${data.surname || ""}`} />
        <Row label="Date of Birth" value={data.dob} />
        <Row label="Gender" value={data.gender} />
        <Row label="Place of Birth" value={`${data.pob || ""}, ${data.sob || ""}`} />
        <Row label="Marital Status" value={data.maritalStatus} />
        <Row label="Citizenship" value={data.citizenshipType} />
        <Row label="Aadhaar" value={data.aadhaar ? `XXXX XXXX ${data.aadhaar.slice(-4)}` : ""} />
        <Row label="PAN" value={data.pan} />
      </Section>

      <Section title="Family Details">
        <Row label="Father's Name" value={`${data.fatherGivenName || ""} ${data.fatherSurname || ""}`} />
        <Row label="Mother's Name" value={`${data.motherGivenName || ""} ${data.motherSurname || ""}`} />
        {data.maritalStatus === "Married" && <Row label="Spouse's Name" value={`${data.spouseGivenName || ""} ${data.spouseSurname || ""}`} />}
      </Section>

      <Section title="Present Address">
        <Row label="Address" value={[data.house, data.street, data.village].filter(Boolean).join(", ")} />
        <Row label="District" value={data.district} />
        <Row label="State" value={data.state2} />
        <Row label="Pincode" value={data.pincode} />
        <Row label="Mobile" value={data.addrMobile} />
      </Section>

      <Section title="Emergency Contact">
        <Row label="Name" value={data.emergencyName} />
        <Row label="Relationship" value={data.emergencyRelation} />
        <Row label="Mobile" value={data.emergencyMobile} />
      </Section>

      <div style={{ background: "#fffbeb", border: "1px solid #d69e2e", borderRadius: "8px", padding: "14px 16px", marginBottom: "20px" }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer", fontSize: "13px", color: "#744210", lineHeight: "1.6" }}>
          <input type="checkbox" id="declaration" style={{ marginTop: "3px", accentColor: "#d69e2e" }} />
          I hereby declare that the information furnished above is true, complete and correct to the best of my knowledge and belief. I understand that in the event of my information being found false or incorrect at any stage, I shall be liable to face legal action as per the Passports Act, 1967.
        </label>
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
        <Btn variant="secondary" onClick={prev} dataTestId="mock-prev">← Back</Btn>
        <Btn variant="success" onClick={next} dataTestId="mock-submit">Submit Application →</Btn>
      </div>
    </div>
  );
}

function StepPayment({ data, setData, next, prev }) {
  const upd = e => setData(p => ({ ...p, [e.target.name]: e.target.value }));
  const base = data.bookletType === "60" ? 1500 : 1500;
  const tatkaalFee = data.serviceType?.includes("Tatkaal") ? 2000 : 0;
  const total = base + tatkaalFee;

  const PayMethod = ({ id, icon, label }) => (
    <label style={{
      display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px",
      border: data.paymentMethod === id ? "2px solid #2b6cb0" : "2px solid #e2e8f0",
      borderRadius: "8px", cursor: "pointer", marginBottom: "10px",
      background: data.paymentMethod === id ? "#ebf8ff" : "#fff"
    }}>
      <input type="radio" name="paymentMethod" value={id} checked={data.paymentMethod === id}
        onChange={upd} style={{ accentColor: "#2b6cb0" }} />
      <span style={{ fontSize: "20px" }}>{icon}</span>
      <span style={{ fontWeight: "600", color: "#2d3748", fontSize: "14px" }}>{label}</span>
    </label>
  );

  return (
    <div>
      <SectionTitle>Fee Payment</SectionTitle>
      <Alert type="info">Payment is mandatory to confirm your application. Amount once paid is non-refundable.</Alert>

      <div style={{ background: "#f7fafc", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
        <div style={{ fontWeight: "700", color: "#2d3748", marginBottom: "12px" }}>Fee Summary</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <tbody>
            <tr><td style={{ padding: "8px 0", color: "#4a5568" }}>Passport Fee ({data.bookletType}pg, {data.validity}yr)</td><td style={{ textAlign: "right", color: "#2d3748", fontWeight: "600" }}>₹{base.toLocaleString()}</td></tr>
            {tatkaalFee > 0 && <tr><td style={{ padding: "8px 0", color: "#4a5568" }}>Tatkaal Charges</td><td style={{ textAlign: "right", color: "#2d3748", fontWeight: "600" }}>₹{tatkaalFee.toLocaleString()}</td></tr>}
            <tr style={{ borderTop: "2px solid #e2e8f0" }}>
              <td style={{ padding: "12px 0 0", fontWeight: "700", color: "#2d3748", fontSize: "16px" }}>Total Payable</td>
              <td style={{ padding: "12px 0 0", textAlign: "right", fontWeight: "800", color: "#2b6cb0", fontSize: "18px" }}>₹{total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#4a5568", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Select Payment Mode</label>
        <PayMethod id="netbanking" icon="🏦" label="Net Banking" />
        <PayMethod id="upi" icon="📱" label="UPI / GPay / PhonePe / Paytm" />
        <PayMethod id="card" icon="💳" label="Debit / Credit Card" />
        <PayMethod id="challan" icon="🧾" label="SBI Bank Challan (offline)" />
      </div>

      {data.paymentMethod === "upi" && (
        <div style={{ background: "#f0fff4", border: "1px solid #38a169", borderRadius: "8px", padding: "16px", marginBottom: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "13px", color: "#276749", marginBottom: "8px" }}>Scan QR Code or pay to UPI ID:</div>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#276749", fontFamily: "monospace" }}>citidoc@sbi</div>
          <div style={{ fontSize: "48px", marginTop: "8px" }}>▦</div>
          <div style={{ fontSize: "12px", color: "#4a5568", marginTop: "4px" }}>Mock QR — No actual payment required (Study Mode)</div>
        </div>
      )}

      {data.paymentMethod === "card" && (
        <div style={{ background: "#f7fafc", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
          <InputField label="Card Number" name="cardNo" value={data.cardNo} onChange={upd} placeholder="XXXX XXXX XXXX XXXX" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <InputField label="Expiry Date" name="cardExpiry" value={data.cardExpiry} onChange={upd} placeholder="MM/YY" />
            <InputField label="CVV" name="cardCvv" value={data.cardCvv} onChange={upd} placeholder="3 digits" />
          </div>
          <InputField label="Cardholder Name" name="cardName" value={data.cardName} onChange={upd} />
        </div>
      )}

      {data.paymentMethod === "netbanking" && (
        <SelectField label="Select Bank" name="bankName" value={data.bankName} onChange={upd}
          options={["State Bank of India", "HDFC Bank", "ICICI Bank", "Punjab National Bank", "Axis Bank", "Kotak Mahindra Bank", "Bank of Baroda", "Canara Bank", "Union Bank of India", "Other"]}
        />
      )}

      <Alert type="warning">⚠️ Study Mode: This is a learning simulation. No actual payment will be processed.</Alert>

      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
        <Btn variant="secondary" onClick={prev} dataTestId="mock-prev">← Back</Btn>
        <Btn variant="success" onClick={next} disabled={!data.paymentMethod} dataTestId="mock-next">Confirm Payment ₹{total.toLocaleString()} →</Btn>
      </div>
    </div>
  );
}

function StepAppointment({ data, setData, next, prev }) {
  const upd = e => setData(p => ({ ...p, [e.target.name]: e.target.value }));
  const slots = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM"];
  const centers = [
    { name: "CitiDoc Service Centre — Connaught Place", addr: "Block D, Central Secretariat Complex, New Delhi — 110001", dist: "2.3 km" },
    { name: "CitiDoc Service Centre — Janakpuri", addr: "C-Block, District Centre, Janakpuri, New Delhi — 110058", dist: "8.7 km" },
    { name: "CitiDoc Service Centre — Rohini", addr: "Sector 7, Near Metro Station, Rohini, New Delhi — 110085", dist: "14.2 km" },
    { name: "CitiDoc Service Centre — Saket", addr: "Plot 1, Pushp Vihar, M.B. Road, Saket, New Delhi — 110017", dist: "5.1 km" },
  ];

  return (
    <div>
      <SectionTitle>Schedule Appointment</SectionTitle>
      <Alert type="success">✅ Payment received! Select a service centre and appointment slot to complete your booking.</Alert>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#4a5568", marginBottom: "10px", textTransform: "uppercase" }}>Select CitiDoc Service Centre</label>
        {centers.map(c => (
          <div key={c.name} onClick={() => setData(p => ({ ...p, selectedCenter: c.name }))}
            style={{
              border: data.selectedCenter === c.name ? "2px solid #2b6cb0" : "2px solid #e2e8f0",
              borderRadius: "10px", padding: "14px 16px", cursor: "pointer", marginBottom: "10px",
              background: data.selectedCenter === c.name ? "#ebf8ff" : "#fff"
            }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: "700", color: "#2d3748", fontSize: "14px" }}>{c.name}</div>
                <div style={{ fontSize: "12px", color: "#718096", marginTop: "2px" }}>{c.addr}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#edf2f7", padding: "4px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", color: "#4a5568", whiteSpace: "nowrap", marginLeft: "12px" }}>
                📍 {c.dist}
              </div>
            </div>
          </div>
        ))}
      </div>

      <InputField label="Preferred Appointment Date" name="appointDate" type="date" value={data.appointDate} onChange={upd} required />

      {data.appointDate && (
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#4a5568", marginBottom: "10px", textTransform: "uppercase" }}>Available Time Slots</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
            {slots.map((s, i) => {
              const avail = i % 3 !== 0;
              return (
                <div key={s} onClick={() => avail && setData(p => ({ ...p, appointSlot: s }))}
                  style={{
                    textAlign: "center", padding: "10px 6px", borderRadius: "8px", fontSize: "13px", fontWeight: "600",
                    cursor: avail ? "pointer" : "not-allowed",
                    border: data.appointSlot === s ? "2px solid #2b6cb0" : "2px solid #e2e8f0",
                    background: !avail ? "#fff5f5" : data.appointSlot === s ? "#ebf8ff" : "#f7fafc",
                    color: !avail ? "#fc8181" : data.appointSlot === s ? "#2b6cb0" : "#4a5568",
                    textDecoration: !avail ? "line-through" : "none"
                  }}>
                  {s}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: "12px", color: "#718096", marginTop: "8px" }}>
            <span style={{ color: "#fc8181" }}>Strikethrough</span> = Booked | <span style={{ color: "#2b6cb0" }}>Blue</span> = Selected
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
        <Btn variant="secondary" onClick={prev} dataTestId="mock-prev">← Back</Btn>
        <Btn onClick={next} disabled={!data.selectedCenter || !data.appointSlot} dataTestId="mock-next">Confirm Appointment →</Btn>
      </div>
    </div>
  );
}

function StepConfirmation({ data }) {
  const arn = `CTD${Date.now().toString().slice(-8)}`;
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎉</div>
      <h2 style={{ color: "#276749", fontSize: "22px", margin: "0 0 8px" }}>Application Submitted Successfully!</h2>
      <p style={{ color: "#4a5568", fontSize: "14px", marginBottom: "24px" }}>Your travel document application has been submitted and appointment scheduled.</p>

      <div style={{ background: "linear-gradient(135deg, #2b6cb0 0%, #2c5282 100%)", borderRadius: "16px", padding: "24px", marginBottom: "24px", color: "#fff" }}>
        <div style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.8, marginBottom: "6px" }}>Application Reference Number</div>
        <div style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "0.05em", fontFamily: "monospace" }}>{arn}</div>
        <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>Save this number for future reference</div>
      </div>

      <div style={{ background: "#f7fafc", borderRadius: "12px", padding: "20px", marginBottom: "24px", textAlign: "left" }}>
        <div style={{ fontWeight: "700", color: "#2d3748", marginBottom: "14px", fontSize: "15px" }}>Appointment Details</div>
        {[
          { icon: "👤", label: "Applicant", value: `${data.givenName || ""} ${data.surname || ""}` },
          { icon: "📍", label: "Centre", value: data.selectedCenter || "—" },
          { icon: "📅", label: "Date", value: data.appointDate || "—" },
          { icon: "⏰", label: "Time", value: data.appointSlot || "—" },
          { icon: "🚀", label: "Service", value: data.serviceType || "—" },
        ].map(r => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid #edf2f7" }}>
            <span style={{ fontSize: "18px" }}>{r.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", color: "#718096", fontWeight: "600", textTransform: "uppercase" }}>{r.label}</div>
              <div style={{ fontSize: "14px", color: "#2d3748", fontWeight: "600" }}>{r.value}</div>
            </div>
          </div>
        ))}
      </div>

      <Alert type="warning">
        <strong>Documents to carry on appointment day:</strong><br />
        • Original + Self-attested copy of all address & identity proofs<br />
        • Printout of this appointment confirmation<br />
        • Original Birth Certificate (for minors)<br />
        • Marriage Certificate (if applicable)<br />
        • Previous passport (if applicable)
      </Alert>

      <div style={{ background: "#f0fff4", border: "1px solid #38a169", borderRadius: "8px", padding: "14px", fontSize: "13px", color: "#276749" }}>
        📧 Confirmation SMS and email has been sent to your registered mobile number and email address.
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function PassportPortal() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});

  const next = () => setCurrentStep(s => Math.min(s + 1, 12));
  const prev = () => setCurrentStep(s => Math.max(s - 1, 1));

  const stepComponents = {
    1: <StepAccount data={formData} setData={setFormData} next={next} />,
    2: <StepAppType data={formData} setData={setFormData} next={next} prev={prev} />,
    3: <StepPersonal data={formData} setData={setFormData} next={next} prev={prev} />,
    4: <StepFamily data={formData} setData={setFormData} next={next} prev={prev} />,
    5: <StepAddress data={formData} setData={setFormData} next={next} prev={prev} />,
    6: <StepEmergency data={formData} setData={setFormData} next={next} prev={prev} />,
    7: <StepPreviousDoc data={formData} setData={setFormData} next={next} prev={prev} />,
    8: <StepOtherInfo data={formData} setData={setFormData} next={next} prev={prev} />,
    9: <StepReview data={formData} next={next} prev={prev} />,
    10: <StepPayment data={formData} setData={setFormData} next={next} prev={prev} />,
    11: <StepAppointment data={formData} setData={setFormData} next={next} prev={prev} />,
    12: <StepConfirmation data={formData} />,
  };

  const progressPct = ((currentStep - 1) / 11) * 100;

  return (
    <div
      style={{ minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
      data-testid="mock-portal-root"
    >
      {/* Top Bar */}
      <div style={{ background: "linear-gradient(90deg, #1a365d 0%, #2b6cb0 100%)", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", background: "rgba(255,255,255,0.2)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>📄</div>
          <div>
            <div style={{ color: "#fff", fontWeight: "800", fontSize: "16px", letterSpacing: "0.02em" }}>CitiDoc Travel Services</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>National Travel Document Application Portal</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", background: "rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: "20px" }}>🎓 Study Mode</span>
          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px" }}>EN | हिंदी</span>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{ background: "#2c5282", padding: "6px 24px", fontSize: "12px", color: "#90cdf4", display: "flex", alignItems: "center", gap: "8px" }}>
        <span>📢</span>
        <span>This is an educational simulation portal for understanding the passport application workflow. No real applications are processed.</span>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ display: "flex", gap: "20px" }}>

          {/* Sidebar */}
          <div style={{ width: "200px", flexShrink: 0 }}>
            <div style={{ background: "#fff", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", position: "sticky", top: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Application Steps</div>
              {steps.map(s => (
                <div key={s.id} style={{
                  display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px",
                  borderRadius: "8px", marginBottom: "4px",
                  background: currentStep === s.id ? "#ebf8ff" : "transparent",
                  cursor: s.id <= currentStep ? "pointer" : "default"
                }}
                  onClick={() => s.id < currentStep && setCurrentStep(s.id)}>
                  <div style={{
                    width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: s.id < currentStep ? "12px" : "11px", fontWeight: "700",
                    background: s.id < currentStep ? "#38a169" : s.id === currentStep ? "#2b6cb0" : "#e2e8f0",
                    color: s.id <= currentStep ? "#fff" : "#718096",
                  }}>
                    {s.id < currentStep ? "✓" : s.id}
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: s.id === currentStep ? "700" : "400", color: s.id === currentStep ? "#2b6cb0" : s.id < currentStep ? "#276749" : "#718096" }}>{s.label}</span>
                </div>
              ))}
              <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "11px", color: "#718096", marginBottom: "6px" }}>Overall Progress</div>
                <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "3px" }}>
                  <div style={{ height: "100%", width: `${progressPct}%`, background: "linear-gradient(90deg, #38a169, #2b6cb0)", borderRadius: "3px", transition: "width 0.4s ease" }} />
                </div>
                <div style={{ fontSize: "11px", color: "#4a5568", marginTop: "4px", fontWeight: "600" }}>{Math.round(progressPct)}% complete</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1 }}>
            <div
              style={{ background: "#fff", borderRadius: "12px", padding: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", minHeight: "400px" }}
              data-testid="mock-step"
              data-step={currentStep}
            >
              {/* Step Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", paddingBottom: "16px", borderBottom: "2px solid #f0f4f8" }}>
                <div style={{ fontSize: "12px", fontWeight: "600", color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Step {currentStep} of {steps.length}
                </div>
                <div style={{ fontSize: "12px", color: "#718096", background: "#f7fafc", padding: "4px 10px", borderRadius: "20px" }}>
                  {steps[currentStep - 1]?.label}
                </div>
              </div>

              {stepComponents[currentStep]}
            </div>

            {/* Footer note */}
            <div style={{ textAlign: "center", marginTop: "16px", fontSize: "12px", color: "#a0aec0" }}>
              CitiDoc Study Simulator · For educational purposes only · Not affiliated with any government agency
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
