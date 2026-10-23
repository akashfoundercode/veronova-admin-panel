import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Headphones, CheckCircle2, Clock, AlertCircle, Eye, EyeOff, Send, UserCheck,
  FileSpreadsheet, Filter, MessageSquare, ShieldCheck, Sparkles, User,
  Plus, Check, Landmark, KeyRound, FileEdit, Contact, Trash2, Edit3,
  ArrowDownToLine, ArrowUpFromLine, RefreshCw, XCircle, AlertTriangle,
  CreditCard, Wallet, HelpCircle, FileText, Image as ImageIcon, ExternalLink,
  Download, Maximize2, X, Copy
} from 'lucide-react'
import DataTable, { exportCSV } from '@/components/DataTable'
import { PageBanner, Modal, useToast } from '@/components/ui'
import { ADMIN_MANAGEMENT_API } from '@/constants/api'
import { apiRequest } from '@/utils/apiClient'

// High-res placeholder proof assets for KYC and verification previews
const PROOF_IMAGES = {
  screenshot: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=1200&auto=format&fit=crop&q=80',
  govt_card: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&auto=format&fit=crop&q=80',
  aadhar: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
  deposit_proof_1: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80',
  deposit_proof_2: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80',
  passbook: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=1200&auto=format&fit=crop&q=80',
  selfie_passbook: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80',
  selfie_id: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&auto=format&fit=crop&q=80',
}

// Seed Fallback Dataset tailored to exact fields requested
const SEED_SUPPORT = [
  // 1. VIEW BANK REQUEST
  // ID, User ID, Account No, IFSC, Passbook, Identity Card, Deposit Proof, Status / Action, Date
  {
    id: 1,
    ticket_id: 'BR_7701',
    category: 'bank_request',
    user_id: 'VN_78291',
    user: 'Vikram Rawat',
    acc_no: '501002938471',
    ifsc: 'HDFC0001245',
    passbook: PROOF_IMAGES.passbook,
    identity_card: PROOF_IMAGES.govt_card,
    deposit_proof: PROOF_IMAGES.deposit_proof_1,
    status: 'In Progress',
    rawStatus: 3,
    date: '16 Oct 2026 09:15 AM',
    remarks: 'Verifying bank passbook IFSC match',
    message: 'Requested linking of HDFC primary salary account.',
  },
  {
    id: 2,
    ticket_id: 'BR_7702',
    category: 'bank_request',
    user_id: 'VN_44102',
    user: 'Aman Verma',
    acc_no: '001201928374',
    ifsc: 'ICIC0000012',
    passbook: PROOF_IMAGES.passbook,
    identity_card: PROOF_IMAGES.govt_card,
    deposit_proof: PROOF_IMAGES.deposit_proof_2,
    status: 'Open',
    rawStatus: 0,
    date: '16 Oct 2026 10:30 AM',
    remarks: 'Pending admin review',
    message: 'Submitted ICICI Bank statement with cancelled cheque.',
  },

  // 2. CHANGE LOGIN PASSWORD
  // ID, User ID, Password, BDG Win ID, Deposit Receipt, Selfie with Passbook, Selfie with ID, Status / Action, Date
  {
    id: 3,
    ticket_id: 'CP_8801',
    category: 'change_password',
    user_id: 'VN_88201',
    user: 'Deepak Mehta',
    password: 'NewPass@9921',
    bdg_win_id: 'BDG_88201',
    deposit_receipt: PROOF_IMAGES.deposit_proof_1,
    selfie_passbook: PROOF_IMAGES.selfie_passbook,
    selfie_id: PROOF_IMAGES.selfie_id,
    status: 'Resolved',
    rawStatus: 1,
    date: '16 Oct 2026 11:20 AM',
    remarks: 'Password reset verified via OTP & selfie KYC',
    message: 'Verified mobile number OTP and reset player account password.',
  },
  {
    id: 4,
    ticket_id: 'CP_8802',
    category: 'change_password',
    user_id: 'VN_99214',
    user: 'Kunal Joshi',
    password: 'Kunal#Win2026',
    bdg_win_id: 'BDG_99214',
    deposit_receipt: PROOF_IMAGES.deposit_proof_2,
    selfie_passbook: PROOF_IMAGES.selfie_passbook,
    selfie_id: PROOF_IMAGES.selfie_id,
    status: 'Open',
    rawStatus: 0,
    date: '16 Oct 2026 12:45 PM',
    remarks: 'Pending selfie match verification',
    message: 'Player forgotten credentials, submitted photo ID & passbook selfie.',
  },

  // 3. IFSC MODIFICATIONS
  // ID, User ID, Account No, IFSC, Status / Remark, Date
  {
    id: 5,
    ticket_id: 'IFSC_5501',
    category: 'ifsc_modification',
    user_id: 'VN_99214',
    user: 'Kunal Joshi',
    acc_no: '30291827461',
    ifsc: 'SBIN0005678',
    status: 'Resolved',
    rawStatus: 1,
    remarks: 'Approved: branch merger updated',
    date: '16 Oct 2026 01:10 PM',
    message: 'Branch IFSC changed from SBIN0001234 to SBIN0005678 after merger.',
  },
  {
    id: 6,
    ticket_id: 'IFSC_5502',
    category: 'ifsc_modification',
    user_id: 'VN_12890',
    user: 'Pooja Singh',
    acc_no: '918273645012',
    ifsc: 'UTIB0000213',
    status: 'Open',
    rawStatus: 0,
    remarks: 'Pending branch audit',
    date: '16 Oct 2026 02:15 PM',
    message: 'Axis Bank branch shifted, requested IFSC correction.',
  },

  // 4. Delete Old USDT (Address - Verifications)
  // ID, User ID, USDT Address, Identity Card, Deposit Receipt, Status, Created At, Action
  {
    id: 7,
    ticket_id: 'USDT_DEL_4401',
    category: 'delete_usdt',
    user_id: 'VN_44102',
    user: 'Aman Verma',
    usdt_address: 'TL9u441XzQ771vMPpo89aKk21vM',
    identity_card: PROOF_IMAGES.govt_card,
    deposit_receipt: PROOF_IMAGES.deposit_proof_1,
    status: 'Resolved',
    rawStatus: 1,
    created_at: '16 Oct 2026 02:20 PM',
    remarks: 'Approved by Admin',
    message: 'Old wallet address compromised, unbinding authorized.',
  },
  {
    id: 8,
    ticket_id: 'USDT_DEL_4402',
    category: 'delete_usdt',
    user_id: 'VN_63019',
    user: 'Sneha Patel',
    usdt_address: 'TX9rZ8vKpLmN2Q44b1x9wEr55TaZ1',
    identity_card: PROOF_IMAGES.govt_card,
    deposit_receipt: PROOF_IMAGES.deposit_proof_2,
    status: 'Open',
    rawStatus: 0,
    created_at: '16 Oct 2026 03:00 PM',
    remarks: 'Pending identity check',
    message: 'Lost private keys, requesting unbind of TRC20 wallet.',
  },

  // 5. Bank Name Modifications
  // ID, User ID, Bank Name, Account No, Status/ Remark, Date
  {
    id: 9,
    ticket_id: 'BN_3301',
    category: 'bank_name',
    user_id: 'VN_33190',
    user: 'Suresh Raina',
    bank_name: 'State Bank of India',
    acc_no: '30291827461',
    status: 'Resolved',
    rawStatus: 1,
    remarks: 'Approved: Name reconciled with Aadhaar',
    date: '16 Oct 2026 01:45 PM',
    message: 'Corrected beneficiary typo from S. Raina to Suresh Kumar Raina.',
  },
  {
    id: 10,
    ticket_id: 'BN_3302',
    category: 'bank_name',
    user_id: 'VN_78291',
    user: 'Vikram Rawat',
    bank_name: 'HDFC Bank Ltd',
    acc_no: '501002938471',
    status: 'Open',
    rawStatus: 0,
    remarks: 'Awaiting revised passbook scan',
    date: '16 Oct 2026 02:50 PM',
    message: 'Added middle name to bank account title.',
  },

  // 6. Game Issue Complaints
  // ID, User ID, Description, Image, Status, Created At
  {
    id: 11,
    ticket_id: 'GC_9901',
    category: 'game_complaints',
    user_id: 'VN_66210',
    user: 'Harish Patel',
    description: 'Wagered ₹500 on Aviator round #8812, game froze before cashout triggered.',
    image: PROOF_IMAGES.screenshot,
    status: 'In Progress',
    rawStatus: 3,
    created_at: '16 Oct 2026 03:15 PM',
    remarks: 'Server telemetry verification in progress',
    message: 'Bet deduction logged, crash recorded at 3.42x without payout.',
  },
  {
    id: 12,
    ticket_id: 'GC_9902',
    category: 'game_complaints',
    user_id: 'VN_11094',
    user: 'Rohit Sharma',
    description: 'WinGo 1-Min round 20261016-042 outcome mismatched with color balance.',
    image: PROOF_IMAGES.screenshot,
    status: 'Open',
    rawStatus: 0,
    created_at: '16 Oct 2026 03:30 PM',
    remarks: 'Pending game engine audit',
    message: 'Bet ₹200 on Green, payout not updated to main wallet.',
  },

  // 7. USDT Verification - Indian Users (15 Columns)
  {
    id: 13,
    ticket_id: 'USDT_9921',
    category: 'verification',
    user: 'Pooja Singh',
    user_id: 'VN_12890',
    region: 'Indian',
    wallet_type: 'TRC20',
    exchange: 'Binance',
    screenshot: PROOF_IMAGES.screenshot,
    govt_card: PROOF_IMAGES.govt_card,
    aadhar: PROOF_IMAGES.aadhar,
    deposit_proof_1: PROOF_IMAGES.deposit_proof_1,
    deposit_proof_2: PROOF_IMAGES.deposit_proof_2,
    usdt_bind: 'Bound',
    new_usdt_address: 'TX9rZ8vKpLmN2Q44b1x9wEr55TaZ1',
    status: 'Open',
    rawStatus: 0,
    submitted_at: '16 Oct 2026 02:45 PM',
    time: '16 Oct 2026 02:45 PM',
    remarks: 'Pending document validation',
    message: 'Submitted Aadhaar, PAN card, and Binance withdrawal transaction hash for address binding.',
  },
  {
    id: 14,
    ticket_id: 'USDT_9922',
    category: 'verification',
    user: 'Vikram Rawat',
    user_id: 'VN_78291',
    region: 'Indian',
    wallet_type: 'BEP20',
    exchange: 'WazirX',
    screenshot: PROOF_IMAGES.screenshot,
    govt_card: PROOF_IMAGES.govt_card,
    aadhar: PROOF_IMAGES.aadhar,
    deposit_proof_1: PROOF_IMAGES.deposit_proof_1,
    deposit_proof_2: PROOF_IMAGES.deposit_proof_2,
    usdt_bind: 'Unbound',
    new_usdt_address: '0x71CB29910eF4892c9081a4b105Cc7',
    status: 'Resolved',
    rawStatus: 1,
    submitted_at: '16 Oct 2026 01:15 PM',
    time: '16 Oct 2026 01:15 PM',
    remarks: 'Approved by Admin',
    message: 'Verified government ID and primary exchange account ownership.',
  },
]

// Department Configuration & REST Endpoints
export const SUB_CATEGORY_CONFIG = {
  bank_request: {
    label: 'View Bank Request',
    shortLabel: 'View Bank Request',
    icon: Landmark,
    desc: 'Audit player bank account verification, passbooks & identity cards',
    fetchUrl: ADMIN_MANAGEMENT_API.viewDeleteWithdraw,
    approveUrl: ADMIN_MANAGEMENT_API.bankAccountChangeStatus,
  },
  change_password: {
    label: 'Change Login Password',
    shortLabel: 'Change Password',
    icon: KeyRound,
    desc: 'Audit password reset requests with selfies and deposit receipts',
    fetchUrl: ADMIN_MANAGEMENT_API.requestChangeLoginPassword,
    approveUrl: ADMIN_MANAGEMENT_API.approveLoginPasswordRequest,
  },
  ifsc_modification: {
    label: 'IFSC Modifications',
    shortLabel: 'IFSC Modifications',
    icon: FileEdit,
    desc: 'Update and audit bank branch IFSC code amendments',
    fetchUrl: ADMIN_MANAGEMENT_API.ifscModifications,
    approveUrl: ADMIN_MANAGEMENT_API.ifscModificationApprove,
  },
  delete_usdt: {
    label: 'Delete Old USDT (Address - Verifications)',
    shortLabel: 'Delete Old USDT',
    icon: Trash2,
    desc: 'Verify identity and unbind legacy TRC20/ERC20 wallet addresses',
    fetchUrl: ADMIN_MANAGEMENT_API.usdtAddressVerification,
    approveUrl: ADMIN_MANAGEMENT_API.changeUsdtAddressStatus,
  },
  bank_name: {
    label: 'Bank Name Modifications',
    shortLabel: 'Bank Name',
    icon: Edit3,
    desc: 'Reconcile beneficiary title mismatch against identity records',
    fetchUrl: ADMIN_MANAGEMENT_API.bankNameModifications,
    approveUrl: ADMIN_MANAGEMENT_API.bankNameModificationApprove,
  },
  game_complaints: {
    label: 'Game Issue Complaints',
    shortLabel: 'Game Complaints',
    icon: AlertCircle,
    desc: 'Investigate bet disconnection, freeze anomalies & round recalculations',
    fetchUrl: ADMIN_MANAGEMENT_API.gameIssueComplaints,
    approveUrl: ADMIN_MANAGEMENT_API.gameIssueComplaintApprove,
  },
  verification: {
    label: 'USDT Verification - Indian Users',
    shortLabel: 'Indian/Non-Indian Verification',
    icon: Contact,
    desc: 'Review player USDT KYC, Government ID, Aadhaar and deposit proof verification',
    fetchUrl: ADMIN_MANAGEMENT_API.usdtVerification,
    approveUrl: ADMIN_MANAGEMENT_API.usdtApprove,
  },
  deposit_problems: {
    label: 'Deposit Problems',
    shortLabel: 'Deposit Problems',
    icon: ArrowDownToLine,
    desc: 'Investigate player deposit discrepancies, missing credits and UTR claims',
    fetchUrl: ADMIN_MANAGEMENT_API.depositProblems,
    approveUrl: ADMIN_MANAGEMENT_API.depositProblemStatus,
  },
  withdraw_problems: {
    label: 'Withdraw Problems',
    shortLabel: 'Withdraw Problems',
    icon: ArrowUpFromLine,
    desc: 'Resolve player withdrawal delays, bank rejections & payout disputes',
    fetchUrl: ADMIN_MANAGEMENT_API.withdrawProblems,
    approveUrl: ADMIN_MANAGEMENT_API.withdrawProblemStatus,
  },
}

// Inline Interactive Password Cell with View Toggle
function PasswordCell({ password = '••••••••' }) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
      <span>{show ? password : '••••••••'}</span>
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="text-slate-400 hover:text-slate-700 transition"
        title={show ? 'Hide Password' : 'Show Password'}
      >
        {show ? <EyeOff size={12} /> : <Eye size={12} />}
      </button>
    </div>
  )
}

export default function CustomerService({ activeCategory = null }) {
  const [rows, setRows] = useState(() => {
    const raw = localStorage.getItem('veronova_support_tickets_v4')
    return raw ? JSON.parse(raw) : SEED_SUPPORT
  })
  const [filterTab, setFilterTab] = useState('ALL') // ALL, OPEN, PROGRESS, RESOLVED
  const [categoryTab, setCategoryTab] = useState(activeCategory || 'ALL')
  const [regionFilter, setRegionFilter] = useState('ALL') // For verification tab
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [previewImage, setPreviewImage] = useState(null) // { url, title, user, userId }
  const [remarksInput, setRemarksInput] = useState('Approved by Admin')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingApi, setIsLoadingApi] = useState(false)
  const [toast, node] = useToast()

  useEffect(() => {
    setCategoryTab(activeCategory || 'ALL')
  }, [activeCategory])

  const persist = (next) => {
    setRows(next)
    try {
      localStorage.setItem('veronova_support_tickets_v4', JSON.stringify(next))
    } catch {
      // Ignore quota error
    }
  }

  // Normalize backend item based on specific category schema
  const normalizeItem = useCallback((item, catKey, index) => {
    const statusVal = item.status
    const isApproved = statusVal === 1 || statusVal === '1' || statusVal === 'Approved' || statusVal === 'resolved'
    const isRejected = statusVal === 2 || statusVal === '2' || statusVal === 'Rejected' || statusVal === 'reject'
    const isProgress = statusVal === 3 || statusVal === '3' || statusVal === 'In Progress'

    let statusLabel = 'Open'
    if (isApproved) statusLabel = 'Resolved'
    else if (isRejected) statusLabel = 'Rejected'
    else if (isProgress) statusLabel = 'In Progress'

    return {
      id: item.id || item._id || index + 1,
      ticket_id: item.ticket_id || item.req_id || item.order_id || `#${item.id || index + 100}`,
      category: catKey || item.category || 'general',
      user: item.user_name || item.username || item.name || item.user || `User_${item.user_id || index + 1}`,
      user_id: item.user_id || item.userId || item.uid || `VN_${10000 + (item.id || index)}`,
      acc_no: item.acc_no || item.account_no || item.accountNo || item.bank_account || '501002938471',
      ifsc: item.ifsc || item.ifsc_code || item.new_ifsc || 'HDFC0001245',
      bank_name: item.bank_name || item.bank || item.bankName || 'State Bank of India',
      password: item.password || item.new_password || 'Admin@Pass#2026',
      bdg_win_id: item.bdg_win_id || item.bdg_id || item.game_uid || item.user_id || 'BDG_88201',
      usdt_address: item.usdt_address || item.address || item.wallet_address || 'TL9u441XzQ771vMPpo89aKk21vM',
      new_usdt_address: item.new_usdt_address || item.usdt_address || item.new_address || 'TX9rZ8vKpLmN2Q44b1x9wEr55TaZ1',
      description: item.description || item.message || item.issue || item.detail || 'Pending review by administration.',
      remarks: item.remarks || item.admin_remarks || 'Approved by Admin',
      status: statusLabel,
      rawStatus: statusVal,
      date: item.date || item.created_at || item.createdAt || item.submitted_at || '16 Oct 2026 02:45 PM',
      created_at: item.created_at || item.createdAt || item.date || '16 Oct 2026 02:45 PM',
      submitted_at: item.submitted_at || item.created_at || item.date || '16 Oct 2026 02:45 PM',
      time: item.date || item.created_at || 'Recent',
      // Document proof URLs
      passbook: item.passbook || item.passbook_image || PROOF_IMAGES.passbook,
      identity_card: item.identity_card || item.id_card || item.govt_card || PROOF_IMAGES.govt_card,
      deposit_proof: item.deposit_proof || item.deposit_receipt || PROOF_IMAGES.deposit_proof_1,
      deposit_receipt: item.deposit_receipt || item.deposit_proof || PROOF_IMAGES.deposit_proof_1,
      deposit_proof_1: item.deposit_proof_1 || item.proof1 || PROOF_IMAGES.deposit_proof_1,
      deposit_proof_2: item.deposit_proof_2 || item.proof2 || PROOF_IMAGES.deposit_proof_2,
      selfie_passbook: item.selfie_passbook || item.selfie_with_passbook || PROOF_IMAGES.selfie_passbook,
      selfie_id: item.selfie_id || item.selfie_with_id || PROOF_IMAGES.selfie_id,
      screenshot: item.screenshot || item.proof || PROOF_IMAGES.screenshot,
      image: item.image || item.screenshot || PROOF_IMAGES.screenshot,
      govt_card: item.govt_card || item.pan_card || item.identity_card || PROOF_IMAGES.govt_card,
      aadhar: item.aadhar || item.aadhaar || PROOF_IMAGES.aadhar,
      region: item.region || (item.country?.toLowerCase().includes('india') || item.is_indian !== false ? 'Indian' : 'Non-Indian'),
      wallet_type: item.wallet_type || item.network || 'TRC20',
      exchange: item.exchange || item.platform || 'Binance',
      usdt_bind: item.usdt_bind || (item.old_address ? 'Bound' : 'Unbound'),
      amount: item.amount || 500,
      utr: item.utr || item.utr_number || '428910293847',
    }
  }, [])

  // Live REST API Fetcher
  const fetchLiveTickets = useCallback(async (catKey = categoryTab) => {
    try {
      setIsLoadingApi(true)

      if (catKey !== 'ALL') {
        const conf = SUB_CATEGORY_CONFIG[catKey]
        if (!conf?.fetchUrl) return

        const res = await apiRequest(conf.fetchUrl)
        const rawList = Array.isArray(res) ? res : (res?.data || res?.list || res?.results || [])
        if (Array.isArray(rawList) && rawList.length > 0) {
          const apiRows = rawList.map((item, idx) => normalizeItem(item, catKey, idx))
          setRows((prev) => {
            const others = prev.filter((r) => r.category !== catKey)
            const combined = [...apiRows, ...others]
            persist(combined)
            return combined
          })
          toast(`Synced ${apiRows.length} records from ${conf.label}`, 'success')
          return
        }
      } else {
        const catEntries = Object.entries(SUB_CATEGORY_CONFIG)
        const promises = catEntries.map(async ([key, conf]) => {
          try {
            const res = await apiRequest(conf.fetchUrl)
            const list = Array.isArray(res) ? res : (res?.data || res?.list || res?.results || [])
            return { key, list }
          } catch {
            return { key, list: [] }
          }
        })

        const results = await Promise.allSettled(promises)
        let totalFetched = 0
        const allFetchedRows = []

        results.forEach((r) => {
          if (r.status === 'fulfilled' && Array.isArray(r.value.list) && r.value.list.length > 0) {
            totalFetched += r.value.list.length
            const mapped = r.value.list.map((item, idx) => normalizeItem(item, r.value.key, idx))
            allFetchedRows.push(...mapped)
          }
        })

        if (totalFetched > 0) {
          setRows(allFetchedRows)
          persist(allFetchedRows)
          toast(`Synced ${totalFetched} live records across departments`, 'success')
        }
      }
    } catch (err) {
      console.warn('[CustomerService] API fetch error (using fallback):', err.message)
    } finally {
      setIsLoadingApi(false)
    }
  }, [categoryTab, normalizeItem, toast])

  useEffect(() => {
    fetchLiveTickets(categoryTab)
  }, [categoryTab, fetchLiveTickets])

  // Filtered Rows
  const displayRows = useMemo(() => {
    return rows.filter((r) => {
      if (categoryTab !== 'ALL' && r.category !== categoryTab) return false
      if (categoryTab === 'verification' && regionFilter !== 'ALL' && r.region !== regionFilter) return false
      if (filterTab === 'OPEN' && r.status !== 'Open') return false
      if (filterTab === 'PROGRESS' && r.status !== 'In Progress') return false
      if (filterTab === 'RESOLVED' && r.status !== 'Resolved') return false
      return true
    })
  }, [rows, filterTab, categoryTab, regionFilter])

  // Status Approver (POST with { status: 1, remarks: "Approved by Admin" })
  const handleUpdateStatus = async (ticket, statusCode, customRemarks = null) => {
    const remarks = customRemarks !== null ? customRemarks : remarksInput
    const statusLabel = statusCode === 1 ? 'Resolved' : statusCode === 2 ? 'Rejected' : 'In Progress'

    try {
      setIsSubmitting(true)
      const conf = SUB_CATEGORY_CONFIG[ticket.category]

      if (conf?.approveUrl) {
        const endpoint = conf.approveUrl(ticket.id)
        await apiRequest(endpoint, {
          method: 'POST',
          body: JSON.stringify({
            status: statusCode,
            remarks: remarks || (statusCode === 1 ? 'Approved by Admin' : 'Rejected by Admin'),
          }),
        })
      }

      const next = rows.map((r) =>
        r.id === ticket.id ? { ...r, status: statusLabel, rawStatus: statusCode, remarks } : r
      )
      persist(next)
      toast(`Record #${ticket.id} updated: ${statusLabel}!`, 'success')

      if (selectedTicket?.id === ticket.id) {
        setSelectedTicket({ ...selectedTicket, status: statusLabel, rawStatus: statusCode, remarks })
      }
    } catch (err) {
      console.warn('API approve error:', err)
      const next = rows.map((r) =>
        r.id === ticket.id ? { ...r, status: statusLabel, rawStatus: statusCode, remarks } : r
      )
      persist(next)
      toast(`Updated #${ticket.id} to ${statusLabel} (Local): ${err.message}`, 'info')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Interactive Document Thumbnail with Lightbox click
  const renderProofThumbnail = (url, title, r) => {
    if (!url) {
      return <span className="text-[11px] text-slate-300 italic">None</span>
    }
    return (
      <div
        onClick={(e) => {
          e.stopPropagation()
          setPreviewImage({ url, title, user: r.user, userId: r.user_id })
        }}
        className="group/img relative flex items-center justify-center h-8 w-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 hover:border-blue-500 hover:ring-2 hover:ring-blue-400/30 cursor-pointer transition shadow-2xs shrink-0"
        title={`Click to preview ${title}`}
      >
        <img
          src={url}
          alt={title}
          className="h-full w-full object-cover transition-transform group-hover/img:scale-110"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center text-white">
          <Eye size={12} />
        </div>
      </div>
    )
  }

  // Render Status Badge
  const renderStatusBadge = (status) => {
    const isApp = status === 'Resolved' || status === 1
    const isRej = status === 'Rejected' || status === 2
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
          isApp
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : isRej
            ? 'bg-rose-50 text-rose-700 border border-rose-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}
      >
        {isApp ? <CheckCircle2 size={11} /> : isRej ? <XCircle size={11} /> : <Clock size={11} />}
        {isApp ? 'Approved' : isRej ? 'Rejected' : 'Pending'}
      </span>
    )
  }

  // Render Action Buttons
  const renderActionButtons = (r) => (
    <div className="flex items-center gap-1">
      <button
        onClick={() => {
          setSelectedTicket(r)
          setRemarksInput(r.remarks || 'Approved by Admin')
        }}
        className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-2xs"
        title="Inspect Details & Proofs"
      >
        <Eye size={13} />
      </button>
      {r.status !== 'Resolved' && (
        <button
          onClick={() => handleUpdateStatus(r, 1, 'Approved by Admin')}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition shadow-2xs"
          title="Approve (Status: 1)"
        >
          <Check size={13} />
        </button>
      )}
      {r.status !== 'Rejected' && (
        <button
          onClick={() => handleUpdateStatus(r, 2, 'Rejected by Admin')}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition shadow-2xs"
          title="Reject (Status: 2)"
        >
          <XCircle size={13} />
        </button>
      )}
    </div>
  )

  // ==========================================
  // EXACT TABLE COLUMNS CONFIGURATIONS PER TAB
  // ==========================================

  // 1. VIEW BANK REQUEST
  // ID, User ID, Account No, IFSC, Passbook, Identity Card, Deposit Proof, Status / Action, Date
  const bankRequestCols = useMemo(() => [
    { key: 'id', label: 'ID', render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span> },
    { key: 'user_id', label: 'User ID', render: (r) => <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{r.user_id}</span> },
    { key: 'acc_no', label: 'Account No', render: (r) => <span className="font-mono text-xs font-extrabold text-slate-900">{r.acc_no}</span> },
    { key: 'ifsc', label: 'IFSC', render: (r) => <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">{r.ifsc}</span> },
    { key: 'passbook', label: 'Passbook', render: (r) => renderProofThumbnail(r.passbook, 'Bank Passbook Proof', r) },
    { key: 'identity_card', label: 'Identity Card', render: (r) => renderProofThumbnail(r.identity_card, 'Identity Card (Aadhaar / PAN)', r) },
    { key: 'deposit_proof', label: 'Deposit Proof', render: (r) => renderProofThumbnail(r.deposit_proof, 'Bank Deposit Slip Receipt', r) },
    {
      key: 'status_action',
      label: 'Status / Action',
      render: (r) => (
        <div className="flex items-center gap-2">
          {renderStatusBadge(r.status)}
          {renderActionButtons(r)}
        </div>
      ),
    },
    { key: 'date', label: 'Date', render: (r) => <span className="font-mono text-[11px] text-slate-500 whitespace-nowrap">{r.date}</span> },
  ], [])

  // 2. CHANGE LOGIN PASSWORD
  // ID, User ID, Password, BDG Win ID, Deposit Receipt, Selfie with Passbook, Selfie with ID, Status / Action, Date
  const changePasswordCols = useMemo(() => [
    { key: 'id', label: 'ID', render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span> },
    { key: 'user_id', label: 'User ID', render: (r) => <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{r.user_id}</span> },
    { key: 'password', label: 'Password', render: (r) => <PasswordCell password={r.password} /> },
    { key: 'bdg_win_id', label: 'BDG Win ID', render: (r) => <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">{r.bdg_win_id}</span> },
    { key: 'deposit_receipt', label: 'Deposit Receipt', render: (r) => renderProofThumbnail(r.deposit_receipt, 'Deposit Receipt Proof', r) },
    { key: 'selfie_passbook', label: 'Selfie with Passbook', render: (r) => renderProofThumbnail(r.selfie_passbook, 'Selfie with Passbook', r) },
    { key: 'selfie_id', label: 'Selfie with ID', render: (r) => renderProofThumbnail(r.selfie_id, 'Selfie with Government ID', r) },
    {
      key: 'status_action',
      label: 'Status / Action',
      render: (r) => (
        <div className="flex items-center gap-2">
          {renderStatusBadge(r.status)}
          {renderActionButtons(r)}
        </div>
      ),
    },
    { key: 'date', label: 'Date', render: (r) => <span className="font-mono text-[11px] text-slate-500 whitespace-nowrap">{r.date}</span> },
  ], [])

  // 3. IFSC MODIFICATIONS
  // ID, User ID, Account No, IFSC, Status / Remark, Date
  const ifscModificationCols = useMemo(() => [
    { key: 'id', label: 'ID', render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span> },
    { key: 'user_id', label: 'User ID', render: (r) => <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{r.user_id}</span> },
    { key: 'acc_no', label: 'Account No', render: (r) => <span className="font-mono text-xs font-extrabold text-slate-900">{r.acc_no}</span> },
    { key: 'ifsc', label: 'IFSC', render: (r) => <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{r.ifsc}</span> },
    {
      key: 'status_remark',
      label: 'Status / Remark',
      render: (r) => (
        <div className="flex items-center gap-2">
          {renderStatusBadge(r.status)}
          <span className="text-[11px] text-slate-600 font-medium truncate max-w-[150px] italic">
            {r.remarks || 'Pending audit'}
          </span>
          {renderActionButtons(r)}
        </div>
      ),
    },
    { key: 'date', label: 'Date', render: (r) => <span className="font-mono text-[11px] text-slate-500 whitespace-nowrap">{r.date}</span> },
  ], [])

  // 4. Delete Old USDT (Address - Verifications)
  // ID, User ID, USDT Address, Identity Card, Deposit Receipt, Status, Created At, Action
  const deleteUsdtCols = useMemo(() => [
    { key: 'id', label: 'ID', render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span> },
    { key: 'user_id', label: 'User ID', render: (r) => <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{r.user_id}</span> },
    {
      key: 'usdt_address',
      label: 'USDT Address',
      render: (r) => (
        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded select-all truncate block max-w-[160px]" title={r.usdt_address}>
          {r.usdt_address}
        </span>
      ),
    },
    { key: 'identity_card', label: 'Identity Card', render: (r) => renderProofThumbnail(r.identity_card, 'Identity Card', r) },
    { key: 'deposit_receipt', label: 'Deposit Receipt', render: (r) => renderProofThumbnail(r.deposit_receipt, 'Deposit Receipt', r) },
    { key: 'status', label: 'Status', render: (r) => renderStatusBadge(r.status) },
    { key: 'created_at', label: 'Created At', render: (r) => <span className="font-mono text-[11px] text-slate-500 whitespace-nowrap">{r.created_at}</span> },
    { key: 'action', label: 'Action', render: (r) => renderActionButtons(r) },
  ], [])

  // 5. Bank Name Modifications
  // ID, User ID, Bank Name, Account No, Status/ Remark, Date
  const bankNameCols = useMemo(() => [
    { key: 'id', label: 'ID', render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span> },
    { key: 'user_id', label: 'User ID', render: (r) => <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{r.user_id}</span> },
    { key: 'bank_name', label: 'Bank Name', render: (r) => <span className="text-xs font-bold text-slate-900">{r.bank_name}</span> },
    { key: 'acc_no', label: 'Account No', render: (r) => <span className="font-mono text-xs font-extrabold text-slate-800">{r.acc_no}</span> },
    {
      key: 'status_remark',
      label: 'Status/ Remark',
      render: (r) => (
        <div className="flex items-center gap-2">
          {renderStatusBadge(r.status)}
          <span className="text-[11px] text-slate-600 font-medium truncate max-w-[150px] italic">
            {r.remarks || 'Pending audit'}
          </span>
          {renderActionButtons(r)}
        </div>
      ),
    },
    { key: 'date', label: 'Date', render: (r) => <span className="font-mono text-[11px] text-slate-500 whitespace-nowrap">{r.date}</span> },
  ], [])

  // 6. Game Issue Complaints
  // ID, User ID, Description, Image, Status, Created At
  const gameComplaintsCols = useMemo(() => [
    { key: 'id', label: 'ID', render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span> },
    { key: 'user_id', label: 'User ID', render: (r) => <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{r.user_id}</span> },
    {
      key: 'description',
      label: 'Description',
      render: (r) => (
        <div className="max-w-[280px]">
          <span className="text-xs font-bold text-slate-900 block truncate">{r.description}</span>
          <span className="text-[11px] text-slate-500 truncate block">{r.message}</span>
        </div>
      ),
    },
    { key: 'image', label: 'Image', render: (r) => renderProofThumbnail(r.image, 'Game Incident Screenshot', r) },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <div className="flex items-center gap-2">
          {renderStatusBadge(r.status)}
          {renderActionButtons(r)}
        </div>
      ),
    },
    { key: 'created_at', label: 'Created At', render: (r) => <span className="font-mono text-[11px] text-slate-500 whitespace-nowrap">{r.created_at}</span> },
  ], [])

  // 7. USDT Verification - Indian Users (Exact 15 Fields)
  // ID, User ID, Region, Wallet Type, Exchange, Screenshot, Govt Card, Aadhar, Deposit Proof 1, Deposit Proof 2, USDT Bind, New USDT Address, Status, Submitted At, Action
  const verificationCols = useMemo(() => [
    { key: 'id', label: 'ID', render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span> },
    { key: 'user_id', label: 'User ID', render: (r) => <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{r.user_id}</span> },
    {
      key: 'region',
      label: 'Region',
      render: (r) => (
        <span className={`inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded ${r.region === 'Indian' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'}`}>
          {r.region === 'Indian' ? '🇮🇳 Indian' : '🌐 Non-Indian'}
        </span>
      ),
    },
    { key: 'wallet_type', label: 'Wallet Type', render: (r) => <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{r.wallet_type || 'TRC20'}</span> },
    { key: 'exchange', label: 'Exchange', render: (r) => <span className="text-xs font-bold text-slate-900">{r.exchange || 'Binance'}</span> },
    { key: 'screenshot', label: 'Screenshot', render: (r) => renderProofThumbnail(r.screenshot, 'App Screenshot', r) },
    { key: 'govt_card', label: 'Govt Card', render: (r) => renderProofThumbnail(r.govt_card, 'Government PAN/ID Card', r) },
    { key: 'aadhar', label: 'Aadhar', render: (r) => renderProofThumbnail(r.aadhar, 'Aadhaar Card Proof', r) },
    { key: 'deposit_proof_1', label: 'Deposit Proof 1', render: (r) => renderProofThumbnail(r.deposit_proof_1, 'Primary Deposit Receipt', r) },
    { key: 'deposit_proof_2', label: 'Deposit Proof 2', render: (r) => renderProofThumbnail(r.deposit_proof_2, 'Secondary Deposit Receipt', r) },
    {
      key: 'usdt_bind',
      label: 'USDT Bind',
      render: (r) => (
        <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded ${r.usdt_bind?.toLowerCase().includes('bound') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
          {r.usdt_bind || 'Unbound'}
        </span>
      ),
    },
    {
      key: 'new_usdt_address',
      label: 'New USDT Address',
      render: (r) => (
        <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded select-all truncate block max-w-[140px]" title={r.new_usdt_address}>
          {r.new_usdt_address}
        </span>
      ),
    },
    { key: 'status', label: 'Status', render: (r) => renderStatusBadge(r.status) },
    { key: 'submitted_at', label: 'Submitted At', render: (r) => <span className="font-mono text-[11px] text-slate-500 whitespace-nowrap">{r.submitted_at}</span> },
    { key: 'action', label: 'Action', render: (r) => renderActionButtons(r) },
  ], [])

  // 8. Deposit Problems
  const depositProblemsCols = useMemo(() => [
    { key: 'id', label: 'ID', render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span> },
    { key: 'user_id', label: 'User ID', render: (r) => <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{r.user_id}</span> },
    { key: 'amount', label: 'Amount', render: (r) => <span className="font-mono text-xs font-black text-emerald-600">₹{Number(r.amount || 0).toLocaleString('en-IN')}</span> },
    { key: 'utr', label: 'UTR', render: (r) => <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{r.utr || 'N/A'}</span> },
    { key: 'deposit_proof', label: 'Receipt', render: (r) => renderProofThumbnail(r.deposit_proof, 'Payment Receipt', r) },
    { key: 'description', label: 'Description', render: (r) => <span className="text-xs text-slate-700 truncate max-w-[220px] block">{r.description || r.message}</span> },
    {
      key: 'status_action',
      label: 'Status / Action',
      render: (r) => (
        <div className="flex items-center gap-2">
          {renderStatusBadge(r.status)}
          {renderActionButtons(r)}
        </div>
      ),
    },
    { key: 'date', label: 'Date', render: (r) => <span className="font-mono text-[11px] text-slate-500 whitespace-nowrap">{r.date}</span> },
  ], [])

  // 9. Withdraw Problems
  const withdrawProblemsCols = useMemo(() => [
    { key: 'id', label: 'ID', render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span> },
    { key: 'user_id', label: 'User ID', render: (r) => <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{r.user_id}</span> },
    { key: 'amount', label: 'Amount', render: (r) => <span className="font-mono text-xs font-black text-rose-600">₹{Number(r.amount || 0).toLocaleString('en-IN')}</span> },
    { key: 'bank_name', label: 'Bank / Account', render: (r) => <span className="text-xs font-bold text-slate-800">{r.bank_name} - {r.acc_no}</span> },
    { key: 'description', label: 'Description', render: (r) => <span className="text-xs text-slate-700 truncate max-w-[220px] block">{r.description || r.message}</span> },
    {
      key: 'status_action',
      label: 'Status / Action',
      render: (r) => (
        <div className="flex items-center gap-2">
          {renderStatusBadge(r.status)}
          {renderActionButtons(r)}
        </div>
      ),
    },
    { key: 'date', label: 'Date', render: (r) => <span className="font-mono text-[11px] text-slate-500 whitespace-nowrap">{r.date}</span> },
  ], [])

  // 10. Overview Columns when categoryTab === 'ALL'
  const allOverviewCols = useMemo(() => [
    { key: 'id', label: 'ID', render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span> },
    { key: 'user_id', label: 'User ID', render: (r) => <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{r.user_id}</span> },
    {
      key: 'category',
      label: 'Department',
      render: (r) => {
        const conf = SUB_CATEGORY_CONFIG[r.category]
        const Icon = conf?.icon || Headphones
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
            <Icon size={12} className="text-blue-600" />
            <span>{conf?.shortLabel || r.category}</span>
          </span>
        )
      },
    },
    {
      key: 'description',
      label: 'Subject / Detail',
      render: (r) => (
        <div className="max-w-[240px]">
          <span className="text-xs font-bold text-slate-900 block truncate">{r.issue || r.description}</span>
          <span className="text-[11px] text-slate-500 truncate block">{r.message}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          {renderStatusBadge(r.status)}
          {renderActionButtons(r)}
        </div>
      ),
    },
    { key: 'date', label: 'Date', render: (r) => <span className="font-mono text-[11px] text-slate-500 whitespace-nowrap">{r.date || r.created_at}</span> },
  ], [])

  // Choose exact columns dynamically matching user specification
  const activeCols = useMemo(() => {
    switch (categoryTab) {
      case 'bank_request':
        return bankRequestCols
      case 'change_password':
        return changePasswordCols
      case 'ifsc_modification':
        return ifscModificationCols
      case 'delete_usdt':
        return deleteUsdtCols
      case 'bank_name':
        return bankNameCols
      case 'game_complaints':
        return gameComplaintsCols
      case 'verification':
        return verificationCols
      case 'deposit_problems':
        return depositProblemsCols
      case 'withdraw_problems':
        return withdrawProblemsCols
      default:
        return allOverviewCols
    }
  }, [
    categoryTab,
    bankRequestCols,
    changePasswordCols,
    ifscModificationCols,
    deleteUsdtCols,
    bankNameCols,
    gameComplaintsCols,
    verificationCols,
    depositProblemsCols,
    withdrawProblemsCols,
    allOverviewCols,
  ])

  // Active Category Meta
  const activeCategoryInfo = SUB_CATEGORY_CONFIG[categoryTab] || null
  let currentTitle = 'Customer Service & Helpdesk Operations'
  if (categoryTab === 'verification') {
    currentTitle = 'USDT Verification - Indian Users'
  } else if (activeCategoryInfo) {
    currentTitle = activeCategoryInfo.label
  }
  const currentIcon = activeCategoryInfo ? activeCategoryInfo.icon : Headphones

  return (
    <div className="space-y-6">
      <PageBanner
        title={currentTitle}
        icon={currentIcon}
        crumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Customer Service', to: '/customer-service' },
          ...(activeCategoryInfo ? [{ label: activeCategoryInfo.label }] : []),
        ]}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-xs font-bold text-emerald-200">
            Exact Fields Configured
          </span>
          <button
            onClick={() => fetchLiveTickets(categoryTab)}
            disabled={isLoadingApi}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 px-3 py-1 text-xs font-bold text-white transition cursor-pointer"
          >
            <RefreshCw size={12} className={isLoadingApi ? 'animate-spin' : ''} />
            <span>{isLoadingApi ? 'Syncing...' : 'Sync Live'}</span>
          </button>
        </div>
      </PageBanner>

      {/* Sub-Category Quick Switcher Navigation */}
      <div className="card bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setCategoryTab('ALL')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
              categoryTab === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Headphones size={13} />
            <span>All Requests</span>
            <span className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${categoryTab === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {rows.length}
            </span>
          </button>

          {Object.entries(SUB_CATEGORY_CONFIG).map(([key, item]) => {
            const count = rows.filter((r) => r.category === key).length
            const active = categoryTab === key
            const Icon = item.icon
            return (
              <button
                key={key}
                onClick={() => setCategoryTab(key)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  active
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={13} />
                <span>{item.shortLabel || item.label}</span>
                <span className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${active ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card p-4 space-y-4 shadow-sm bg-white rounded-2xl border border-slate-200/80">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'ALL', label: 'All Entries', count: displayRows.length },
              { id: 'OPEN', label: 'Pending', count: displayRows.filter((r) => r.status === 'Open').length },
              { id: 'PROGRESS', label: 'In Progress', count: displayRows.filter((r) => r.status === 'In Progress').length },
              { id: 'RESOLVED', label: 'Approved', count: displayRows.filter((r) => r.status === 'Resolved').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  filterTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-black">{tab.count}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchLiveTickets(categoryTab)}
              disabled={isLoadingApi}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              title="Refresh Current List from API"
            >
              <RefreshCw size={13} className={isLoadingApi ? 'animate-spin text-blue-600' : 'text-slate-500'} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => exportCSV(`customer_${categoryTab}_data`, activeCols, displayRows)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              <FileSpreadsheet size={15} /> Export to Excel
            </button>
          </div>
        </div>

        <DataTable
          columns={activeCols}
          rows={displayRows}
          unit="entries"
          placeholder={`Search ${activeCategoryInfo?.label || 'records'} by user ID, account, IFSC, or details...`}
        />
      </div>

      {/* High-Resolution Document Lightbox Modal */}
      {previewImage && (
        <Modal
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          title={`Document Proof: ${previewImage.title}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs border-b pb-2">
              <div>
                <span className="text-slate-400">Player:</span> <strong className="text-slate-800">{previewImage.user}</strong>
                <span className="mx-2 text-slate-300">•</span>
                <span className="text-slate-400">User ID:</span> <strong className="font-mono text-blue-600">{previewImage.userId}</strong>
              </div>
              <a
                href={previewImage.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
              >
                <span>Open Full</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center min-h-[300px] max-h-[500px]">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[500px] w-auto max-w-full object-contain"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Ticket Details & Action Modal */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Audit Request: #${selectedTicket.ticket_id || selectedTicket.id}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-900 p-4 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">Department</span>
                <span className="font-mono text-[10px] bg-white/10 px-2 py-0.5 rounded text-sky-300">
                  {SUB_CATEGORY_CONFIG[selectedTicket.category]?.label || selectedTicket.category}
                </span>
              </div>
              <p className="text-sm font-bold mt-1.5 text-white">{selectedTicket.issue || selectedTicket.description}</p>
              <p className="text-slate-300 mt-2 bg-white/10 p-2.5 rounded-lg text-xs leading-relaxed">
                {selectedTicket.message}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl space-y-2 border border-slate-100 font-medium">
              <div className="flex justify-between"><span>User ID:</span><strong className="font-mono text-blue-700">{selectedTicket.user_id}</strong></div>
              <div className="flex justify-between"><span>Player Name:</span><strong>{selectedTicket.user}</strong></div>
              {selectedTicket.acc_no && <div className="flex justify-between"><span>Account No:</span><strong className="font-mono">{selectedTicket.acc_no}</strong></div>}
              {selectedTicket.ifsc && <div className="flex justify-between"><span>IFSC Code:</span><strong className="font-mono text-indigo-700">{selectedTicket.ifsc}</strong></div>}
              {selectedTicket.bank_name && <div className="flex justify-between"><span>Bank Name:</span><strong>{selectedTicket.bank_name}</strong></div>}
              {selectedTicket.usdt_address && <div className="flex justify-between"><span>USDT Address:</span><strong className="font-mono text-emerald-700">{selectedTicket.usdt_address}</strong></div>}
              {selectedTicket.bdg_win_id && <div className="flex justify-between"><span>BDG Win ID:</span><strong className="font-mono text-purple-700">{selectedTicket.bdg_win_id}</strong></div>}
              {selectedTicket.date && <div className="flex justify-between"><span>Date / Timestamp:</span><strong className="font-mono">{selectedTicket.date}</strong></div>}
              <div className="flex justify-between"><span>Current Status:</span><strong className="text-blue-600">{selectedTicket.status}</strong></div>
            </div>

            {/* Admin Remarks Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">Admin Remarks (Sent in API body):</label>
              <input
                type="text"
                value={remarksInput}
                onChange={(e) => setRemarksInput(e.target.value)}
                placeholder="e.g. Approved by Admin"
                className="input !py-2 !text-xs !w-full bg-white border-slate-200 rounded-xl"
              />
            </div>

            {/* Status Update Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t">
              <button
                onClick={() => handleUpdateStatus(selectedTicket, 2, remarksInput)}
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-rose-50 py-2.5 font-bold text-rose-700 hover:bg-rose-100 transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <XCircle size={14} /> Reject (Status 2)
              </button>

              <button
                onClick={() => handleUpdateStatus(selectedTicket, 1, remarksInput)}
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 font-bold text-white hover:bg-emerald-700 transition flex items-center justify-center gap-1 shadow-md cursor-pointer"
              >
                <Check size={14} /> Approve (Status 1)
              </button>
            </div>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}
