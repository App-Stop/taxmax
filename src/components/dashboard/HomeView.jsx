import { useState } from 'react';
import DocumentThumb, { DocumentStatus } from './DocumentThumb';
import NotificationItem from './NotificationItem';
import { initialsOf } from './dashboardData';

const imgCaretDown = "/figma/dashboard/caret-down.svg";
const imgUploadSimple = "/figma/dashboard/upload-simple.svg";
const imgResourceIrs = "/figma/dashboard/resource-irs.png";
const imgArrowUpRight = "/figma/dashboard/arrow-up-right.svg";
const imgPhoneHome = "/figma/dashboard/app-phone-home.png";
const imgPhoneChat = "/figma/dashboard/app-phone-chat.png";
const imgAppStore = "/figma/appstore.png";
const imgGoogleStore = "/figma/googlestore.png";
const imgQrCode = "/figma/dashboard/qr-code.svg";
const imgArrowRight = "/figma/dashboard/arrow-right.svg";

const MAX_VISIBLE_DOCUMENTS = 3;
const IRS_URL = "https://www.irs.gov/wheres-my-refund";

const GUIDES = [
  {
    title: '2026 Important Tax Deadlines',
    body: 'Stay ahead of penalty dates. Here are the official IRS filing and estimated payment dates you need to mark on your calendar:',
  },
  {
    title: 'Tax Record Retention Guide',
    body: `"When in doubt, don't throw it out." Federal law requires keeping documentation, but how long should you hold onto records?`,
  },
];

function SectionTitle({ children }) {
  return <p className="font-bold leading-[normal] text-[16px] text-[#111] w-full">{children}</p>;
}

function DocumentsPlaceholder({ children }) {
  return (
    <div className="bg-[#f5f5f5] flex flex-col gap-[8px] items-center justify-center p-[20px] rounded-[20px] w-full text-center">
      {children}
    </div>
  );
}

export default function HomeView({ documents, documentsLoading, documentsError, onRetryDocuments, preparer, updates, newMessageCount, onOpenDocument, onOpenUpload, onContact, onViewTaxTools }) {
  const [showAllDocuments, setShowAllDocuments] = useState(false);
  const visibleDocuments = showAllDocuments ? documents : documents.slice(0, MAX_VISIBLE_DOCUMENTS);

  return (
    <div className="flex flex-col lg:flex-row gap-[30px] lg:gap-[122px] items-center lg:items-start lg:justify-center px-[16px] lg:pl-0 lg:pr-[36px] pt-[8px] lg:pt-[80px] pb-[60px] lg:pb-[80px]">
      {/* Left column (Node 71:1766) */}
      <div className="flex flex-col gap-[30px] items-start w-full max-w-[385px] lg:w-[385px] shrink-0" data-node-id="71:1766">
        <div className="flex flex-col gap-[16px] items-start w-full" data-node-id="71:1767">
          <div className="flex gap-[16px] items-center w-full">
            <div className="flex-[1_0_0] min-w-px">
              <SectionTitle>Your documents</SectionTitle>
            </div>
            {documents.length > MAX_VISIBLE_DOCUMENTS && (
              <button
                type="button"
                onClick={() => setShowAllDocuments(!showAllDocuments)}
                aria-expanded={showAllDocuments}
                className="font-semibold leading-[normal] text-[14px] text-[#0094c5] whitespace-nowrap cursor-pointer hover:underline"
              >
                {showAllDocuments ? 'Show less' : 'See all'}
              </button>
            )}
          </div>
          <div className="flex flex-col gap-[10px] items-center justify-center w-full" data-node-id="71:1769">
            {documentsLoading && (
              <DocumentsPlaceholder>
                <p className="font-medium text-[14px] text-[#848484]">Loading your documents…</p>
              </DocumentsPlaceholder>
            )}
            {!documentsLoading && documentsError && (
              <DocumentsPlaceholder>
                <p className="font-medium text-[14px] text-[#444]">{documentsError}</p>
                <button type="button" onClick={onRetryDocuments} className="font-semibold text-[14px] text-[#0094c5] cursor-pointer hover:underline">
                  Try again
                </button>
              </DocumentsPlaceholder>
            )}
            {!documentsLoading && !documentsError && documents.length === 0 && (
              <DocumentsPlaceholder>
                <p className="font-semibold text-[14px] text-[#111]">No documents yet</p>
                <p className="font-medium text-[12px] text-[#848484]">Upload your W-2, 1099 or other tax forms to get started.</p>
              </DocumentsPlaceholder>
            )}
            {visibleDocuments.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => onOpenDocument(doc.id)}
                className="bg-[#f5f5f5] cursor-pointer flex gap-[16px] items-center p-[16px] rounded-[20px] shrink-0 w-full transition-shadow hover:shadow-[inset_0_0_0_1px_#0094c5] focus-visible:shadow-[inset_0_0_0_1px_#0094c5] outline-none"
              >
                <DocumentThumb doc={doc} className="size-[46px]" />
                <div className="flex flex-[1_0_0] flex-col gap-[4px] items-start justify-center min-w-px">
                  <p className="font-semibold leading-[normal] text-[16px] text-[#111] text-left w-full">{doc.name}</p>
                  <DocumentStatus status={doc.status} />
                </div>
                <div className="flex items-center justify-center shrink-0 size-[16px]">
                  <div className="-rotate-90 flex-none">
                    <div className="relative size-[16px]">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCaretDown} />
                    </div>
                  </div>
                </div>
              </button>
            ))}
            <button
              type="button"
              onClick={onOpenUpload}
              className="bg-[rgba(0,148,197,0.1)] hover:bg-[rgba(0,148,197,0.16)] transition-colors cursor-pointer flex gap-[8px] h-[52px] items-center justify-center p-[12px] rounded-[100px] shrink-0 w-full"
              data-node-id="71:1802"
            >
              <span className="font-['DM_Sans',sans-serif] font-semibold leading-[normal] text-[16px] text-[#0094c5] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
                {documents.length ? 'Upload another document' : 'Upload a document'}
              </span>
              <span className="relative shrink-0 size-[24px]">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgUploadSimple} />
              </span>
            </button>
            <p className="font-medium leading-[normal] text-[12px] text-[#848484] text-center tracking-[0.24px] w-[272px]" data-node-id="71:1805">
              All sensitive SSN and wage data are encrypted at rest and in transit.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-[16px] items-start w-full" data-node-id="71:1806">
          <SectionTitle>Assigned preparer</SectionTitle>
          <div className="bg-[#f5f5f5] flex h-[81px] items-center justify-between p-[16px] rounded-[20px] shrink-0 w-full" data-node-id="71:1808">
            <div className="flex flex-[1_0_0] gap-[8px] items-center min-w-px">
              {preparer?.avatar ? (
                <div className="relative shrink-0 size-[40px]">
                  <div className="absolute inset-[-2.5%]">
                    <img alt="" className="block max-w-none size-full" height="42" src={preparer.avatar} width="42" />
                  </div>
                </div>
              ) : (
                // Team members have no photo in the API, so their initials stand in.
                <div className="bg-[rgba(0,148,197,0.1)] flex items-center justify-center rounded-[100px] shrink-0 size-[40px]">
                  <p className="font-extrabold leading-[normal] text-[14px] text-[#0094c5]">
                    {preparer ? initialsOf({ fullName: preparer.name }) : '?'}
                  </p>
                </div>
              )}
              <div className="flex flex-[1_0_0] flex-col gap-[2px] items-start justify-center min-w-px">
                <p className="font-semibold leading-[normal] text-[16px] text-[#111] w-full">{preparer ? preparer.name : 'Not assigned yet'}</p>
                {preparer ? (
                  <p className={`leading-[20px] text-[12px] w-full ${newMessageCount ? 'font-bold text-[#0094c5]' : 'font-medium text-[#848484]'}`}>
                    {newMessageCount ? `${newMessageCount} new message${newMessageCount > 1 ? 's' : ''}` : 'No new messages'}
                  </p>
                ) : (
                  <p className="font-medium leading-[20px] text-[12px] text-[#848484] w-full">A preparer will be assigned to you shortly</p>
                )}
              </div>
            </div>
            {preparer && (
              <button type="button" onClick={onContact} className="font-semibold leading-[normal] text-[14px] text-[#0094c5] whitespace-nowrap cursor-pointer hover:underline" data-node-id="71:1814">
                Contact
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-[16px] items-start w-full" data-node-id="71:1815">
          <SectionTitle>Recent updates</SectionTitle>
          <div className="flex flex-col gap-[10px] items-start w-full" data-node-id="71:1817">
            {updates.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
            {updates.length === 0 && (
              <p className="font-medium leading-[normal] text-[12px] text-[#848484]">Updates on your documents will show up here.</p>
            )}
          </div>
        </div>
      </div>

      {/* Resources column (Node 71:1845) */}
      <div className="flex flex-col gap-[16px] items-start w-full max-w-[385px] lg:w-[385px] shrink-0" data-node-id="71:1845">
        <SectionTitle>Resources</SectionTitle>

        <div className="bg-[#f5f5f5] border border-[#e8e8e8] border-solid flex flex-col items-start justify-center overflow-clip rounded-[20px] shrink-0 w-full" data-node-id="71:1847">
          <div className="aspect-[370/155] relative shrink-0 w-full">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute h-[137.59%] left-0 max-w-none top-[-37.54%] w-[102.01%]" src={imgResourceIrs} />
            </div>
          </div>
          <div className="flex gap-[20px] items-center p-[16px] shrink-0 w-full">
            <p className="flex-[1_0_0] font-semibold leading-[normal] min-w-px text-[14px] text-[#111]">
              Track your filing with the official
              <br />
              United States IRS Website
            </p>
            <a href={IRS_URL} target="_blank" rel="noopener noreferrer" className="flex gap-[10px] items-center shrink-0 hover:opacity-80 transition-opacity" data-node-id="71:1851">
              <span className="font-bold leading-[normal] text-[14px] text-[#0094c5] whitespace-nowrap">Visit</span>
              <span className="relative shrink-0 size-[16px]">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowUpRight} />
              </span>
            </a>
          </div>
        </div>

        <div className="bg-[#f5f5f5] flex flex-col items-start justify-center overflow-clip rounded-[20px] shrink-0 w-full" data-node-id="71:1854">
          <div className="bg-[rgba(0,148,197,0.1)] h-[186px] overflow-clip relative shrink-0 w-full">
            <div className="absolute h-[228.448px] left-[95.62px] rounded-[13.44px] top-[25.72px] w-[105.076px]">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[13.44px] size-full" src={imgPhoneHome} />
            </div>
            <div className="absolute h-[169.651px] left-[213.21px] rounded-[10.08px] top-[55.11px] w-[78.032px]">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10.08px] size-full" src={imgPhoneChat} />
            </div>
          </div>
          <div className="flex flex-col gap-[16px] items-start p-[20px] shrink-0 w-full">
            <div className="flex flex-col gap-[10px] items-start text-black w-full">
              <p className="font-bold leading-[normal] text-[20px] w-full">Track on the go</p>
              <p className="font-medium leading-[24px] text-[14px] w-full">
                Use our mobile app to track your filing status, contact with your preparer and more insights.
              </p>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-[14px] items-start justify-center shrink-0">
                <img alt="Download on the App Store" className="block h-[40.643px] w-[108.864px]" src={imgAppStore} />
                <img alt="Get it on Google Play" className="block h-[40.643px] w-[108.864px]" src={imgGoogleStore} />
              </div>
              <div className="h-[105px] relative shrink-0 w-[104px]">
                <img alt="QR code for the TAXMAX mobile app" className="absolute block inset-0 max-w-none size-full" src={imgQrCode} />
              </div>
            </div>
          </div>
        </div>

        {GUIDES.map((guide) => (
          <div key={guide.title} className="bg-[#f5f5f5] flex flex-col gap-[16px] items-start justify-center overflow-clip p-[16px] rounded-[20px] shrink-0 w-full">
            <div className="flex flex-col gap-[6px] items-start text-[#111] w-full">
              <p className="font-semibold leading-[normal] text-[16px] w-full">{guide.title}</p>
              <p className="font-normal leading-[24px] opacity-80 text-[14px] w-full">{guide.body}</p>
            </div>
            <button type="button" onClick={onViewTaxTools} className="flex gap-[10px] items-center justify-center overflow-clip shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
              <span className="font-bold leading-[normal] text-[14px] text-[#0094c5] text-center whitespace-nowrap">View</span>
              <span className="relative shrink-0 size-[20px]">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowRight} />
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
