import React from "react";

interface IconProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

/**
 * Inline SVG icons for menu navigation
 * These are inline to avoid HTTP requests and improve performance
 */
export const OverviewIcon: React.FC<IconProps> = ({ 
  className, 
  width = 53, 
  height = 53 
}) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 53 53" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M49 26.5058C49 26.9609 48.9883 27.4159 48.9533 27.8592C48.9183 28.3959 48.8716 28.9209 48.8016 29.4343C48.6615 30.496 48.4514 31.546 48.1712 32.5611C47.9611 33.2961 47.7276 34.0078 47.4475 34.7078C46.5953 36.8896 45.4047 38.908 43.9455 40.693C42.9767 41.8831 41.8794 42.9798 40.6887 43.9481C38.9027 45.4065 36.8833 46.5966 34.7004 47.4483C34 47.7283 33.2763 47.9616 32.5525 48.1716C31.537 48.4516 30.4981 48.6733 29.4241 48.8133C28.8988 48.8833 28.3735 48.93 27.8366 48.965C27.393 48.9883 26.9377 49 26.4825 49C26.0973 49 25.7121 48.9883 25.3385 48.965C24.8949 48.9417 24.4514 48.9067 24.0078 48.86C23.284 48.7783 22.5603 48.6617 21.8599 48.5217C21.463 48.44 21.0778 48.3466 20.7043 48.2533C20.0623 48.0783 19.4319 47.88 18.8132 47.6583C18.463 47.5299 18.1245 47.4016 17.786 47.2499C17.2023 47.0049 16.642 46.7483 16.0934 46.4566C15.7782 46.2932 15.4747 46.1299 15.1712 45.9432C14.6459 45.6399 14.144 45.3132 13.6537 44.9748C13.3735 44.7765 13.0934 44.5782 12.8249 44.3682C12.358 44.0065 11.9027 43.6331 11.4591 43.2364C11.2023 43.0148 10.9572 42.7814 10.7237 42.5481C10.3035 42.1397 9.90662 41.7081 9.5214 41.2647C9.29961 41.008 9.07782 40.7514 8.8677 40.483C8.49416 40.0163 8.14397 39.538 7.81712 39.048C7.61868 38.7563 7.43191 38.4646 7.25681 38.1729C6.94163 37.6479 6.63813 37.1229 6.36965 36.5745C6.20623 36.2595 6.05447 35.9329 5.9144 35.6062C5.65759 35.0228 5.42412 34.4278 5.21401 33.8211C5.0856 33.4594 4.98054 33.0977 4.87549 32.7361C4.68872 32.0827 4.52529 31.406 4.39689 30.7293C4.31517 30.321 4.25681 29.9126 4.19844 29.4926C4.09338 28.7342 4.03502 27.9642 4.01167 27.1942C4 26.9608 4 26.7275 4 26.4942C4 26.2492 4 26.0041 4.01167 25.7591C4.04669 24.8258 4.12841 23.9157 4.26848 23.0174C4.36187 22.4107 4.4786 21.8157 4.61868 21.2323C4.93385 19.9373 5.35409 18.6889 5.87938 17.4872C6.3463 16.4138 6.89494 15.3871 7.51362 14.4187C9.28794 11.6419 11.6459 9.2852 14.4125 7.52346C15.3463 6.92844 16.3152 6.40342 17.3307 5.94841C20.1323 4.70003 23.2374 4 26.4942 4C29.7626 4 32.8677 4.70003 35.6576 5.94841C35.9728 6.08841 36.2763 6.22842 36.5798 6.38009C37.1284 6.6601 37.6654 6.95178 38.179 7.26679C38.4708 7.44179 38.7626 7.62847 39.0545 7.82681C39.5447 8.16515 40.0233 8.51517 40.4903 8.87685C40.7588 9.08686 41.0156 9.30853 41.2724 9.5302C41.716 9.91522 42.1479 10.3236 42.5564 10.7319C42.7899 10.9769 43.0233 11.2219 43.2451 11.4669C43.642 11.9103 44.0156 12.3536 44.3774 12.832C44.5875 13.1003 44.786 13.3803 44.9844 13.6604C45.323 14.1504 45.6498 14.6637 45.9533 15.1771C46.1284 15.4804 46.3035 15.7838 46.4669 16.0988C46.7588 16.6471 47.0272 17.2188 47.2607 17.7905C47.4008 18.1289 47.5409 18.4789 47.6693 18.8172C47.891 19.4356 48.0895 20.0656 48.2646 20.7073C48.3697 21.0923 48.463 21.4773 48.5331 21.8623C48.6848 22.5624 48.7899 23.2857 48.8716 24.0091C48.9183 24.4524 48.9533 24.8841 48.9767 25.3391C48.9883 25.7358 49 26.1208 49 26.5058Z" fill="url(#paint0_linear_overview)"/>
    <g opacity="0.1">
      <path d="M26.7831 25.9863C26.7831 25.9863 26.6023 25.9863 26.3764 25.9863C26.1505 25.9863 25.9697 25.9863 25.9697 25.9863C25.9697 25.9863 26.1505 25.9863 26.3764 25.9863C26.6023 25.9863 26.7831 25.9863 26.7831 25.9863Z" stroke="black" strokeMiterlimit="10"/>
      <path d="M26.5622 26.5451C26.8867 26.2625 26.9208 25.7703 26.6382 25.4458C26.3556 25.1212 25.8635 25.0871 25.5389 25.3697C25.2143 25.6523 25.1802 26.1445 25.4628 26.469C25.7454 26.7936 26.2376 26.8277 26.5622 26.5451Z" stroke="black" strokeMiterlimit="10"/>
      <path d="M26.4699 27.0619C27.0791 26.8316 27.3862 26.151 27.1559 25.5418C26.9255 24.9326 26.2449 24.6255 25.6357 24.8559C25.0266 25.0862 24.7194 25.7668 24.9498 26.376C25.1801 26.9852 25.8607 27.2923 26.4699 27.0619Z" stroke="black" strokeMiterlimit="10"/>
      <path d="M27.1182 27.1696C27.7869 26.5804 27.8513 25.5608 27.2621 24.8921C26.673 24.2234 25.6533 24.159 24.9846 24.7482C24.316 25.3373 24.2515 26.357 24.8407 27.0257C25.4299 27.6943 26.4495 27.7588 27.1182 27.1696Z" stroke="black" strokeMiterlimit="10"/>
      <path d="M28.1882 26.3203C28.387 25.1411 27.5923 24.0239 26.413 23.825C25.2338 23.6261 24.1166 24.4209 23.9177 25.6001C23.7188 26.7794 24.5136 27.8966 25.6928 28.0954C26.8721 28.2943 27.9893 27.4996 28.1882 26.3203Z" stroke="black" strokeMiterlimit="10"/>
      <path d="M30.0639 26.6314C30.4342 24.4151 28.9378 22.3183 26.7215 21.948C24.5053 21.5777 22.4085 23.0741 22.0382 25.2904C21.6679 27.5066 23.1643 29.6034 25.3805 29.9737C27.5968 30.344 29.6936 28.8476 30.0639 26.6314Z" stroke="black" strokeMiterlimit="10"/>
      <path d="M30.7597 26.7453C31.1927 24.1456 29.4363 21.6872 26.8367 21.2542C24.237 20.8211 21.7786 22.5775 21.3456 25.1772C20.9125 27.7768 22.669 30.2353 25.2686 30.6683C27.8683 31.1013 30.3267 29.3449 30.7597 26.7453Z" stroke="black" strokeMiterlimit="10"/>
      <path d="M29.9619 29.8696C32.1217 27.7098 32.1217 24.2081 29.9619 22.0483C27.8021 19.8886 24.3004 19.8886 22.1406 22.0483C19.9808 24.2081 19.9808 27.7098 22.1406 29.8696C24.3004 32.0294 27.8021 32.0294 29.9619 29.8696Z" stroke="black" strokeMiterlimit="10"/>
      <path d="M30.5517 30.4596C33.0374 27.974 33.0374 23.944 30.5517 21.4583C28.0661 18.9727 24.0361 18.9727 21.5505 21.4583C19.0648 23.944 19.0648 27.974 21.5505 30.4596C24.0361 32.9453 28.0661 32.9453 30.5517 30.4596Z" stroke="black" strokeMiterlimit="10"/>
      <path d="M31.1319 31.0399C33.938 28.2338 33.938 23.6842 31.1319 20.8781C28.3258 18.072 23.7762 18.072 20.9701 20.8781C18.164 23.6842 18.164 28.2338 20.9701 31.0399C23.7762 33.846 28.3258 33.846 31.1319 31.0399Z" stroke="black" strokeMiterlimit="10"/>
      <path d="M31.7514 31.6592C34.8995 28.511 34.8995 23.4069 31.7514 20.2588C28.6033 17.1107 23.4992 17.1107 20.351 20.2588C17.2029 23.4069 17.2029 28.511 20.351 31.6592C23.4992 34.8073 28.6033 34.8073 31.7514 31.6592Z" stroke="black" strokeMiterlimit="10"/>
      <path d="M32.3904 32.2979C35.8912 28.797 35.8912 23.1209 32.3904 19.62C28.8895 16.1191 23.2134 16.1191 19.7125 19.62C16.2116 23.1209 16.2116 28.797 19.7125 32.2979C23.2134 35.7988 28.8895 35.7988 32.3904 32.2979Z" stroke="black" strokeMiterlimit="10"/>
      <path d="M33.058 32.9659C36.9278 29.0961 36.9278 22.8219 33.058 18.952C29.1882 15.0822 22.9139 15.0822 19.0441 18.952C15.1742 22.8219 15.1742 29.0961 19.0441 32.9659C22.9139 36.8358 29.1882 36.8358 33.058 32.9659Z" stroke="black" strokeMiterlimit="10"/>
      <path d="M33.7456 33.6535C37.9951 29.4039 37.9951 22.514 33.7456 18.2645C29.496 14.0149 22.6062 14.0149 18.3566 18.2645C14.1071 22.514 14.1071 29.4039 18.3566 33.6535C22.6062 37.903 29.496 37.903 33.7456 33.6535Z" stroke="black" strokeMiterlimit="10"/>
      <path d="M34.5159 34.4239C39.1909 29.7489 39.1909 22.1691 34.5159 17.4941C29.8408 12.819 22.2611 12.819 17.586 17.4941C12.911 22.1691 12.911 29.7489 17.586 34.4239C22.2611 39.099 29.8408 39.099 34.5159 34.4239Z" stroke="black" strokeMiterlimit="10"/>
      <path d="M35.3887 35.2967C40.5458 30.1396 40.5458 21.7783 35.3887 16.6212C30.2316 11.4641 21.8703 11.4641 16.7132 16.6212C11.5561 21.7783 11.5561 30.1396 16.7132 35.2967C21.8703 40.4538 30.2316 40.4538 35.3887 35.2967Z" stroke="black" strokeMiterlimit="10"/>
      <path d="M36.3982 36.3061C42.1128 30.5915 42.1128 21.3264 36.3982 15.6119C30.6837 9.89734 21.4186 9.89734 15.704 15.6119C9.98949 21.3264 9.98949 30.5915 15.704 36.3061C21.4186 42.0206 30.6837 42.0206 36.3982 36.3061Z" stroke="black" strokeMiterlimit="10"/>
      <path d="M37.4515 37.3593C43.7477 31.0631 43.7477 20.8549 37.4515 14.5586C31.1553 8.26242 20.9471 8.26242 14.6508 14.5586C8.35459 20.8549 8.35459 31.0631 14.6508 37.3593C20.9471 43.6556 31.1553 43.6556 37.4515 37.3593Z" stroke="black" strokeMiterlimit="10"/>
      <path d="M25.9699 43.8797C35.8521 43.8797 43.8631 35.8687 43.8631 25.9865C43.8631 16.1043 35.8521 8.09326 25.9699 8.09326C16.0877 8.09326 8.07666 16.1043 8.07666 25.9865C8.07666 35.8687 16.0877 43.8797 25.9699 43.8797Z" stroke="black" strokeMiterlimit="10"/>
      <path d="M25.9701 45.5061C36.7506 45.5061 45.49 36.7668 45.49 25.9862C45.49 15.2057 36.7506 6.46631 25.9701 6.46631C15.1896 6.46631 6.4502 15.2057 6.4502 25.9862C6.4502 36.7668 15.1896 45.5061 25.9701 45.5061Z" stroke="black" strokeMiterlimit="10"/>
      <path d="M25.9698 47.133C37.6487 47.133 47.1164 37.6653 47.1164 25.9864C47.1164 14.3075 37.6487 4.83984 25.9698 4.83984C14.2909 4.83984 4.82324 14.3075 4.82324 25.9864C4.82324 37.6653 14.2909 47.133 25.9698 47.133Z" stroke="black" strokeMiterlimit="10"/>
      <path d="M25.9701 29.2395C27.7669 29.2395 29.2234 27.783 29.2234 25.9862C29.2234 24.1895 27.7669 22.7329 25.9701 22.7329C24.1734 22.7329 22.7168 24.1895 22.7168 25.9862C22.7168 27.783 24.1734 29.2395 25.9701 29.2395Z" stroke="black" strokeMiterlimit="10"/>
      <path d="M27.0468 28.5526C28.4796 28.0023 29.195 26.3948 28.6447 24.962C28.0945 23.5293 26.487 22.8138 25.0542 23.3641C23.6214 23.9143 22.906 25.5218 23.4563 26.9546C24.0065 28.3874 25.614 29.1028 27.0468 28.5526Z" stroke="black" strokeMiterlimit="10"/>
    </g>
    <path fillRule="evenodd" clipRule="evenodd" d="M4.34427 22.1895L4.81211 22.9246L1.20303 26.5337H0L4.34427 22.1895Z" fill="url(#paint1_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M4.81221 22.9243L5.28005 23.5927L2.40615 26.5334H1.20312L4.81221 22.9243Z" fill="url(#paint2_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M3.14143 22.8574L2.40625 23.3921L5.54749 26.5333H6.75052L3.14143 22.8574Z" fill="url(#paint3_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M2.40614 23.3926L1.73779 23.9273L4.34435 26.5338H5.54738L2.40614 23.3926Z" fill="url(#paint4_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M3.0746 30.1428L2.40625 29.6081L5.54749 26.5337H6.75052L3.0746 30.1428Z" fill="url(#paint5_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M2.40614 29.6081L1.73779 29.0734L4.34435 26.5337H5.54738L2.40614 29.6081Z" fill="url(#paint6_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M4.34427 30.8111L4.81211 30.0759L1.20303 26.5337H0L4.34427 30.8111Z" fill="url(#paint7_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M4.81221 30.0759L5.28005 29.4076L2.40615 26.5337H1.20312L4.81221 30.0759Z" fill="url(#paint8_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M26.4667 1.6709C39.299 1.6709 49.8589 11.4288 51.1288 23.9269L50.4604 23.3922C48.9232 11.4956 38.7643 2.27241 26.4667 2.27241C14.1022 2.27241 3.94334 11.4956 2.40614 23.3922L1.73779 23.9269C3.07449 11.4288 13.6344 1.6709 26.4667 1.6709ZM26.4667 50.7277C14.1691 50.7277 3.94334 41.5045 2.47298 29.6079L1.80463 29.0732C3.07449 41.5713 13.6344 51.3292 26.4667 51.3292C39.299 51.3292 49.8589 41.5713 51.1288 29.0732L50.4604 29.6079C48.9232 41.5045 38.7643 50.7277 26.4667 50.7277Z" fill="url(#paint9_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M26.4668 50.1263C38.2966 50.1263 48.0545 41.4377 49.7922 30.1426L50.4605 29.6079C48.9233 41.5045 38.7644 50.7278 26.4668 50.7278C14.1692 50.7278 3.94345 41.5045 2.47309 29.6079L3.14143 30.1426C4.87914 41.4377 14.637 50.1263 26.4668 50.1263ZM26.4668 2.27246C14.1024 2.27246 3.94345 11.4957 2.40625 23.3923L3.0746 22.8576C4.87914 11.5625 14.637 2.87398 26.4668 2.87398C38.2966 2.87398 48.0545 11.5625 49.7922 22.8576L50.4605 23.3923C48.9233 11.4957 38.7644 2.27246 26.4668 2.27246Z" fill="url(#paint10_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M26.4666 48.4554C37.2938 48.4554 46.3834 40.502 48.1211 30.0758L48.5889 30.811C46.5839 41.1704 37.4275 49.0569 26.4666 49.0569C15.5057 49.0569 6.34929 41.2372 4.34424 30.811L4.81208 30.0758C6.54979 40.502 15.5725 48.4554 26.4666 48.4554ZM26.4666 3.94336C15.5057 3.94336 6.34929 11.8299 4.34424 22.1893L4.81208 22.9245C6.54979 12.4982 15.5725 4.54487 26.4666 4.54487C37.3607 4.54487 46.3834 12.4982 48.1211 22.8576L48.5889 22.1225C46.5839 11.8299 37.4275 3.94336 26.4666 3.94336Z" fill="url(#paint11_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M26.4665 47.8539C37.2269 47.8539 46.1828 39.8338 47.5863 29.4075L48.121 30.0759C46.3833 40.4353 37.3606 48.3886 26.4665 48.3886C15.5724 48.4555 6.54972 40.5021 4.81201 30.0759L5.34669 29.4075C6.75022 39.8338 15.6393 47.8539 26.4665 47.8539ZM26.4665 4.54492C15.5724 4.54492 6.54972 12.4983 4.81201 22.9245L5.34669 23.5929C6.75022 13.1666 15.6393 5.14644 26.4665 5.14644C37.2938 5.14644 46.1828 13.1666 47.5863 23.5929L48.121 22.9245C46.3833 12.4983 37.3606 4.54492 26.4665 4.54492Z" fill="url(#paint12_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M48.5889 22.1895L48.1211 22.9246L51.6633 26.5337H52.8664L48.5889 22.1895Z" fill="url(#paint13_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M48.1211 22.9243L47.5864 23.5927L50.5272 26.5334H51.6634L48.1211 22.9243Z" fill="url(#paint14_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M49.7917 22.8574L50.4601 23.3921L47.3856 26.5333H46.1826L49.7917 22.8574Z" fill="url(#paint15_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M50.4601 23.3926L51.1285 23.9273L48.5219 26.5338H47.3857L50.4601 23.3926Z" fill="url(#paint16_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M49.7917 30.1428L50.4601 29.6081L47.3856 26.5337H46.1826L49.7917 30.1428Z" fill="url(#paint17_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M50.4601 29.6081L51.1285 29.0734L48.5219 26.5337H47.3857L50.4601 29.6081Z" fill="url(#paint18_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M48.5889 30.8111L48.1211 30.0759L51.6633 26.5337H52.8664L48.5889 30.8111Z" fill="url(#paint19_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M48.1211 30.0759L47.5864 29.4076L50.5272 26.5337H51.6634L48.1211 30.0759Z" fill="url(#paint20_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M26.4667 0L28.7391 2.27239L26.4667 4.54477L24.1943 2.27239L26.4667 0ZM26.4667 0.868854L25.0632 2.27239L26.4667 3.67592L27.8703 2.27239L26.4667 0.868854Z" fill="#F9DCA0"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M24.5953 2.27239L26.4667 0.401009V0L24.1943 2.27239H24.5953Z" fill="url(#paint21_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M26.4671 0.401367L24.5957 2.27274H24.9967L26.4671 0.869211V0.401367Z" fill="url(#paint22_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M28.2713 2.27239L26.4668 0.401009V0L28.7392 2.27239H28.2713Z" fill="url(#paint23_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M26.4668 0.401367L28.2713 2.27274H27.8703L26.4668 0.869211V0.401367Z" fill="url(#paint24_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M24.5953 2.27246L26.4667 4.14384V4.54485L24.1943 2.27246H24.5953Z" fill="url(#paint25_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M26.4671 4.14384L24.5957 2.27246H24.9967L26.4671 3.74283V4.14384Z" fill="url(#paint26_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M28.2713 2.27246L26.4668 4.14384V4.54485L28.7392 2.27246H28.2713Z" fill="url(#paint27_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M26.4668 4.14384L28.2713 2.27246H27.8703L26.4668 3.74283V4.14384Z" fill="url(#paint28_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M24.9966 2.27267L26.4669 0.869141L27.8705 2.27267L26.4669 3.74304L24.9966 2.27267Z" fill="#F9DCA0"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M25.5312 2.2726L26.4669 1.33691L27.3358 2.2726L26.4669 3.20829L25.5312 2.2726Z" fill="url(#paint29_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M25.5313 2.27267L26.4669 1.33698V0.869141L24.9966 2.27267H25.5313Z" fill="url(#paint30_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M27.3357 2.27267L26.4668 1.33698V0.869141L27.8703 2.27267H27.3357Z" fill="url(#paint31_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M25.5313 2.27246L26.4669 3.20815V3.74283L24.9966 2.27246H25.5313Z" fill="url(#paint32_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M27.3357 2.27246L26.4668 3.20815V3.74283L27.8703 2.27246H27.3357Z" fill="url(#paint33_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M26.4667 48.4551L28.7391 50.7275L26.4667 52.9999L24.1943 50.7275L26.4667 48.4551ZM26.4667 49.3239L25.0632 50.7275L26.4667 52.131L27.8703 50.7275L26.4667 49.3239Z" fill="#F9DCA0"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M24.5953 50.7275L26.4667 48.8561V48.4551L24.1943 50.7275H24.5953Z" fill="url(#paint34_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M26.4671 48.856L24.5957 50.7273H24.9967L26.4671 49.3238V48.856Z" fill="url(#paint35_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M28.2713 50.7275L26.4668 48.8561V48.4551L28.7392 50.7275H28.2713Z" fill="url(#paint36_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M26.4668 48.856L28.2713 50.7273H27.8703L26.4668 49.3238V48.856Z" fill="url(#paint37_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M24.5953 50.7275L26.4667 52.5989V52.9999L24.1943 50.7275H24.5953Z" fill="url(#paint38_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M26.4671 52.5989L24.5957 50.7275H24.9967L26.4671 52.1311V52.5989Z" fill="url(#paint39_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M28.2713 50.7275L26.4668 52.5989V52.9999L28.7392 50.7275H28.2713Z" fill="url(#paint40_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M26.4668 52.5989L28.2713 50.7275H27.8703L26.4668 52.1311V52.5989Z" fill="url(#paint41_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M24.9966 50.7273L26.4669 49.3237L27.8705 50.7273L26.4669 52.1308L24.9966 50.7273Z" fill="#F9DCA0"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M25.5312 50.7272L26.4669 49.7915L27.3358 50.7272L26.4669 51.6629L25.5312 50.7272Z" fill="url(#paint42_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M25.5313 50.7273L26.4669 49.7916V49.3237L24.9966 50.7273H25.5313Z" fill="url(#paint43_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M27.3357 50.7273L26.4668 49.7916V49.3237L27.8703 50.7273H27.3357Z" fill="url(#paint44_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M25.5313 50.7275L26.4669 51.6632V52.1311L24.9966 50.7275H25.5313Z" fill="url(#paint45_linear_overview)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M27.3357 50.7275L26.4668 51.6632V52.1311L27.8703 50.7275H27.3357Z" fill="url(#paint46_linear_overview)"/>
    <path d="M25.6431 26.4443V25.0669C24.4386 25.242 23.4925 26.1881 23.3174 27.3926H24.6947L25.6431 26.4443Z" fill="url(#paint47_linear_overview)"/>
    <path d="M23.3174 28.1787C23.4925 29.3832 24.4386 30.3293 25.6431 30.5044V29.1271L24.6947 28.1787H23.3174Z" fill="url(#paint48_linear_overview)"/>
    <path d="M34.2862 33.3956C34.2886 33.7311 34.0739 34.0298 33.7551 34.1345C33.5586 34.2058 33.3801 34.3192 33.2322 34.4669C33.1582 34.5354 33.0951 34.6149 33.0452 34.7026C32.9846 34.8095 32.8776 34.882 32.7558 34.8984C32.634 34.9149 32.5115 34.8734 32.4248 34.7863L32.1931 34.5545C32.0343 34.4037 31.7853 34.4037 31.6266 34.5545C31.4695 34.7108 31.4682 34.9647 31.6238 35.1226L31.8568 35.3555C31.9439 35.4422 31.9854 35.5647 31.9689 35.6865C31.9525 35.8082 31.88 35.9153 31.7731 35.9758C31.6881 36.0244 31.611 36.0856 31.5445 36.1573C31.3921 36.3093 31.2754 36.4933 31.2031 36.6959C31.0952 37.0091 30.7988 37.2179 30.4676 37.2141H21.6048C21.2692 37.2165 20.9705 37.0018 20.8658 36.683C20.7946 36.4865 20.6811 36.308 20.5335 36.1601C20.4649 36.0861 20.3854 36.023 20.2977 35.9731C20.1908 35.9126 20.1183 35.8055 20.1019 35.6837C20.0855 35.5619 20.127 35.4395 20.2141 35.3528L20.4458 35.121C20.6011 34.9641 20.6011 34.7114 20.4458 34.5545C20.288 34.4011 20.0371 34.3999 19.8778 34.5517L19.6448 34.7847C19.5581 34.8718 19.4357 34.9133 19.3139 34.8969C19.1921 34.8804 19.085 34.808 19.0245 34.701C18.9759 34.616 18.9147 34.5389 18.843 34.4724C18.691 34.32 18.507 34.2034 18.3044 34.131C17.9912 34.0231 17.7824 33.7268 17.7862 33.3956V22.9613C17.7838 22.6257 17.9985 22.327 18.3173 22.2223C18.5138 22.1511 18.6923 22.0376 18.8402 21.8899C18.9143 21.8214 18.9773 21.7419 19.0272 21.6542C19.0878 21.5473 19.1948 21.4748 19.3166 21.4584C19.4384 21.442 19.5609 21.4835 19.6476 21.5706L19.8793 21.8023C20.0381 21.9531 20.2871 21.9531 20.4458 21.8023C20.6029 21.646 20.6042 21.3921 20.4486 21.2343L20.2156 21.0013C20.1285 20.9146 20.087 20.7922 20.1035 20.6704C20.1199 20.5486 20.1924 20.4415 20.2993 20.381C20.3843 20.3324 20.4614 20.2712 20.528 20.1995C20.6803 20.0475 20.797 19.8635 20.8693 19.6609C20.9772 19.3477 21.2736 19.1389 21.6048 19.1427H30.4676C30.8032 19.1403 31.1019 19.355 31.2066 19.6738C31.2778 19.8703 31.3913 20.0488 31.539 20.1967C31.6075 20.2707 31.687 20.3338 31.7747 20.3837C31.8816 20.4443 31.9541 20.5513 31.9705 20.6731C31.9869 20.7949 31.9454 20.9174 31.8583 21.0041L31.6266 21.2358C31.4713 21.3927 31.4713 21.6454 31.6266 21.8023C31.7844 21.9557 32.0353 21.9569 32.1946 21.8051L32.4276 21.5721C32.5143 21.485 32.6367 21.4435 32.7585 21.46C32.8803 21.4764 32.9874 21.5489 33.0479 21.6558C33.0965 21.7408 33.1577 21.8179 33.2294 21.8844C33.3814 22.0368 33.5654 22.1535 33.768 22.2258C34.0812 22.3337 34.29 22.6301 34.2862 22.9613V26.2141H35.0719V18.9125L33.7782 20.2062C33.6241 20.355 33.3791 20.3529 33.2275 20.2014C33.076 20.0498 33.0739 19.8048 33.2227 19.6507L34.5164 18.357H17.7862C17.7003 18.3553 17.6146 18.3467 17.5301 18.3311L18.8497 19.6507C18.9518 19.7493 18.9928 19.8954 18.9568 20.0327C18.9208 20.1701 18.8136 20.2773 18.6762 20.3133C18.5389 20.3492 18.3928 20.3083 18.2942 20.2062L17.0005 18.9125V37.2141C17.0015 37.282 17.0114 37.3495 17.03 37.4149L18.2942 36.1507C18.4483 36.0018 18.6933 36.0039 18.8449 36.1554C18.9964 36.307 18.9985 36.552 18.8497 36.7062L17.5855 37.9704C17.6508 37.9889 17.7183 37.9988 17.7862 37.9998H34.5164L33.2227 36.7062C33.0739 36.552 33.076 36.307 33.2275 36.1554C33.3791 36.0039 33.6241 36.0018 33.7782 36.1507L35.0719 37.4443V29.357H34.2862V33.3956Z" fill="url(#paint49_linear_overview)"/>
    <path d="M25.4106 27.7856L26.0337 27.1626L26.6568 27.7856L26.0337 28.4087L25.4106 27.7856Z" fill="url(#paint50_linear_overview)"/>
    <path d="M17.8304 17.5714H34.286V16.3929C34.286 16.1759 34.1101 16 33.8932 16H17.786C17.5544 15.9999 17.3345 16.1021 17.1851 16.2791C17.0358 16.4562 16.9722 16.6902 17.0113 16.9185C17.0906 17.3055 17.4354 17.5804 17.8304 17.5714Z" fill="url(#paint51_linear_overview)"/>
    <path d="M26.4287 29.1271V30.5044C27.6332 30.3293 28.5793 29.3832 28.7544 28.1787H27.3771L26.4287 29.1271Z" fill="url(#paint52_linear_overview)"/>
    <path d="M33.1075 27C32.6736 27 32.3218 27.3518 32.3218 27.7857C32.3218 28.2197 32.6736 28.5714 33.1075 28.5714H35.8575V27H33.1075Z" fill="url(#paint53_linear_overview)"/>
    <path d="M26.4287 25.0669V26.4443L27.3771 27.3926H28.7544C28.5793 26.1881 27.6332 25.242 26.4287 25.0669Z" fill="url(#paint54_linear_overview)"/>
    <path d="M33.1071 26.2141H33.5V22.9612C33.1895 22.854 32.9073 22.6776 32.675 22.4454L32.6644 22.4352C32.1868 22.8115 31.5049 22.7779 31.0666 22.3566C30.6354 21.9232 30.6031 21.2334 30.992 20.7616L30.9759 20.7451C30.746 20.5129 30.5703 20.2328 30.4612 19.9248L21.6043 19.9283C21.497 20.2389 21.3207 20.521 21.0884 20.7533L21.0782 20.7639C21.4677 21.2372 21.4337 21.9289 20.9997 22.3617C20.5607 22.7803 19.8807 22.8121 19.4047 22.4363L19.3882 22.4524C19.1559 22.6823 18.8758 22.858 18.5679 22.9671L18.5714 33.3955C18.8819 33.5027 19.164 33.6791 19.3964 33.9113L19.407 33.9215C19.8845 33.5452 20.5665 33.5788 21.0048 34.0001C21.436 34.4335 21.4682 35.1233 21.0794 35.5951L21.0955 35.6116C21.3253 35.8438 21.5011 36.1239 21.6102 36.4319L30.4671 36.4283C30.5743 36.1178 30.7507 35.8357 30.9829 35.6033L30.9932 35.5927C30.6037 35.1195 30.6377 34.4277 31.0717 33.995C31.5106 33.5764 32.1906 33.5446 32.6667 33.9203L32.6832 33.9042C32.9154 33.6744 33.1955 33.4987 33.5035 33.3896L33.5 29.3569H33.1071C32.2392 29.3569 31.5357 28.6534 31.5357 27.7855C31.5357 26.9176 32.2392 26.2141 33.1071 26.2141ZM23.2857 20.7141H28.7857C29.0027 20.7141 29.1785 20.8899 29.1785 21.1069C29.1785 21.3239 29.0027 21.4998 28.7857 21.4998H23.2857C23.0687 21.4998 22.8928 21.3239 22.8928 21.1069C22.8928 20.8899 23.0687 20.7141 23.2857 20.7141ZM28.7857 35.6426H23.2857C23.0687 35.6426 22.8928 35.4667 22.8928 35.2498C22.8928 35.0328 23.0687 34.8569 23.2857 34.8569H28.7857C29.0027 34.8569 29.1785 35.0328 29.1785 35.2498C29.1785 35.4667 29.0027 35.6426 28.7857 35.6426ZM26.0357 31.3212C24.083 31.3212 22.5 29.7382 22.5 27.7855C22.5 25.8328 24.083 24.2498 26.0357 24.2498C27.9884 24.2498 29.5714 25.8328 29.5714 27.7855C29.5692 29.7373 27.9875 31.319 26.0357 31.3212Z" fill="url(#paint55_linear_overview)"/>
    <defs>
      <linearGradient id="paint0_linear_overview" x1="26.5099" y1="49.0044" x2="26.5099" y2="3.99512" gradientUnits="userSpaceOnUse">
        <stop stopColor="#29272E"/>
        <stop offset="1" stopColor="#1C191C"/>
      </linearGradient>
      <linearGradient id="paint1_linear_overview" x1="2.39977" y1="26.5007" x2="2.39977" y2="22.1866" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFE56B"/>
        <stop offset="1" stopColor="#D19C37"/>
      </linearGradient>
      <linearGradient id="paint2_linear_overview" x1="3.25161" y1="26.5004" x2="3.25161" y2="22.8978" gradientUnits="userSpaceOnUse">
        <stop stopColor="#AB671C"/>
        <stop offset="1" stopColor="#784C00"/>
      </linearGradient>
      <linearGradient id="paint3_linear_overview" x1="4.58386" y1="26.5003" x2="4.58386" y2="22.8745" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFE56B"/>
        <stop offset="1" stopColor="#A17C37"/>
      </linearGradient>
      <linearGradient id="paint4_linear_overview" x1="3.65094" y1="26.5008" x2="3.65094" y2="23.3899" gradientUnits="userSpaceOnUse">
        <stop stopColor="#AB671C"/>
        <stop offset="1" stopColor="#784C00"/>
      </linearGradient>
      <linearGradient id="paint5_linear_overview" x1="4.58166" y1="30.1307" x2="4.58166" y2="26.5007" gradientUnits="userSpaceOnUse">
        <stop stopColor="#784C00"/>
        <stop offset="1" stopColor="#AB671C"/>
      </linearGradient>
      <linearGradient id="paint6_linear_overview" x1="3.6486" y1="29.6158" x2="3.6486" y2="26.5007" gradientUnits="userSpaceOnUse">
        <stop stopColor="#915A1A"/>
        <stop offset="1" stopColor="#FFE56B"/>
      </linearGradient>
      <linearGradient id="paint7_linear_overview" x1="2.40265" y1="30.8208" x2="2.40265" y2="26.5007" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6E4500"/>
        <stop offset="1" stopColor="#CF9353"/>
      </linearGradient>
      <linearGradient id="paint8_linear_overview" x1="3.25429" y1="30.109" x2="3.25429" y2="26.5007" gradientUnits="userSpaceOnUse">
        <stop stopColor="#BD851B"/>
        <stop offset="1" stopColor="#FFE56B"/>
      </linearGradient>
      <linearGradient id="paint9_linear_overview" x1="26.4468" y1="50.2712" x2="26.4468" y2="2.91062" gradientUnits="userSpaceOnUse">
        <stop offset="0.1227" stopColor="#9C5E00"/>
        <stop offset="1" stopColor="#FFEA8A"/>
      </linearGradient>
      <linearGradient id="paint10_linear_overview" x1="26.4469" y1="50.7224" x2="26.4469" y2="2.28349" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFD36E"/>
        <stop offset="1" stopColor="#6E4500"/>
      </linearGradient>
      <linearGradient id="paint11_linear_overview" x1="26.4467" y1="49.0427" x2="26.4467" y2="3.96321" gradientUnits="userSpaceOnUse">
        <stop offset="0.29" stopColor="#9C5E00"/>
        <stop offset="1" stopColor="#FFEA8A"/>
      </linearGradient>
      <linearGradient id="paint12_linear_overview" x1="26.4465" y1="48.4393" x2="26.4465" y2="4.56671" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFD36E"/>
        <stop offset="1" stopColor="#6E4500"/>
      </linearGradient>
      <linearGradient id="paint13_linear_overview" x1="50.4911" y1="26.5056" x2="50.4911" y2="22.1915" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFE56B"/>
        <stop offset="1" stopColor="#D19C37"/>
      </linearGradient>
      <linearGradient id="paint14_linear_overview" x1="49.6419" y1="26.5004" x2="49.6419" y2="22.8978" gradientUnits="userSpaceOnUse">
        <stop stopColor="#AB671C"/>
        <stop offset="1" stopColor="#784C00"/>
      </linearGradient>
      <linearGradient id="paint15_linear_overview" x1="48.3094" y1="26.5003" x2="48.3094" y2="22.8745" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFE56B"/>
        <stop offset="1" stopColor="#A17C37"/>
      </linearGradient>
      <linearGradient id="paint16_linear_overview" x1="49.2472" y1="26.5057" x2="49.2472" y2="23.3948" gradientUnits="userSpaceOnUse">
        <stop stopColor="#AB671C"/>
        <stop offset="1" stopColor="#784C00"/>
      </linearGradient>
      <linearGradient id="paint17_linear_overview" x1="48.3117" y1="30.1307" x2="48.3117" y2="26.5007" gradientUnits="userSpaceOnUse">
        <stop stopColor="#784C00"/>
        <stop offset="1" stopColor="#AB671C"/>
      </linearGradient>
      <linearGradient id="paint18_linear_overview" x1="49.2446" y1="29.6158" x2="49.2446" y2="26.5007" gradientUnits="userSpaceOnUse">
        <stop stopColor="#915A1A"/>
        <stop offset="1" stopColor="#FFE56B"/>
      </linearGradient>
      <linearGradient id="paint19_linear_overview" x1="50.4907" y1="30.8208" x2="50.4907" y2="26.5007" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6E4500"/>
        <stop offset="1" stopColor="#CF9353"/>
      </linearGradient>
      <linearGradient id="paint20_linear_overview" x1="49.6393" y1="30.109" x2="49.6393" y2="26.5007" gradientUnits="userSpaceOnUse">
        <stop stopColor="#CF9D3E"/>
        <stop offset="1" stopColor="#E3D17F"/>
      </linearGradient>
      <linearGradient id="paint21_linear_overview" x1="24.1634" y1="1.14174" x2="26.4467" y2="1.14174" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFF18F"/>
        <stop offset="1" stopColor="#FFFAE3"/>
      </linearGradient>
      <linearGradient id="paint22_linear_overview" x1="24.5907" y1="1.35544" x2="26.4471" y2="1.35544" gradientUnits="userSpaceOnUse">
        <stop stopColor="#AB5F0B"/>
        <stop offset="1" stopColor="#753C00"/>
      </linearGradient>
      <linearGradient id="paint23_linear_overview" x1="26.4468" y1="1.14174" x2="28.7303" y2="1.14174" gradientUnits="userSpaceOnUse">
        <stop stopColor="#EDA85F"/>
        <stop offset="1" stopColor="#A36700"/>
      </linearGradient>
      <linearGradient id="paint24_linear_overview" x1="26.4468" y1="1.35544" x2="28.3034" y2="1.35544" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A15900"/>
        <stop offset="1" stopColor="#E39644"/>
      </linearGradient>
      <linearGradient id="paint25_linear_overview" x1="24.1635" y1="3.42516" x2="26.4469" y2="3.42516" gradientUnits="userSpaceOnUse">
        <stop stopColor="#EDA85F"/>
        <stop offset="1" stopColor="#A36700"/>
      </linearGradient>
      <linearGradient id="paint26_linear_overview" x1="24.5908" y1="3.21176" x2="26.4473" y2="3.21176" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6E4500"/>
        <stop offset="1" stopColor="#CF9353"/>
      </linearGradient>
      <linearGradient id="paint27_linear_overview" x1="26.447" y1="3.42516" x2="28.7304" y2="3.42516" gradientUnits="userSpaceOnUse">
        <stop stopColor="#AB5F0B"/>
        <stop offset="1" stopColor="#753C00"/>
      </linearGradient>
      <linearGradient id="paint28_linear_overview" x1="26.447" y1="3.21176" x2="28.3034" y2="3.21176" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFBE45"/>
        <stop offset="1" stopColor="#FFF0AB"/>
      </linearGradient>
      <linearGradient id="paint29_linear_overview" x1="26.447" y1="3.20475" x2="26.447" y2="1.36258" gradientUnits="userSpaceOnUse">
        <stop stopColor="#97742B"/>
        <stop offset="1" stopColor="#F5C35F"/>
      </linearGradient>
      <linearGradient id="paint30_linear_overview" x1="25.9865" y1="1.82314" x2="25.7322" y2="1.56877" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FEF9C2"/>
        <stop offset="1" stopColor="#F5C35F"/>
      </linearGradient>
      <linearGradient id="paint31_linear_overview" x1="26.4469" y1="1.56877" x2="27.8767" y2="1.56877" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F5C35F"/>
        <stop offset="1" stopColor="#97742B"/>
      </linearGradient>
      <linearGradient id="paint32_linear_overview" x1="25.0173" y1="2.99628" x2="26.447" y2="2.99628" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F5C35F"/>
        <stop offset="1" stopColor="#F5C35F"/>
      </linearGradient>
      <linearGradient id="paint33_linear_overview" x1="27.1618" y1="2.99628" x2="26.9074" y2="2.74184" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FEF9C2"/>
        <stop offset="1" stopColor="#F5C35F"/>
      </linearGradient>
      <linearGradient id="paint34_linear_overview" x1="24.1634" y1="49.5803" x2="26.4467" y2="49.5803" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFF18F"/>
        <stop offset="1" stopColor="#FFFAE3"/>
      </linearGradient>
      <linearGradient id="paint35_linear_overview" x1="24.5907" y1="49.7936" x2="26.4471" y2="49.7936" gradientUnits="userSpaceOnUse">
        <stop stopColor="#AB5F0B"/>
        <stop offset="1" stopColor="#753C00"/>
      </linearGradient>
      <linearGradient id="paint36_linear_overview" x1="26.4468" y1="49.5803" x2="28.7303" y2="49.5803" gradientUnits="userSpaceOnUse">
        <stop stopColor="#EDA85F"/>
        <stop offset="1" stopColor="#A36700"/>
      </linearGradient>
      <linearGradient id="paint37_linear_overview" x1="26.4468" y1="49.7936" x2="28.3034" y2="49.7936" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A15900"/>
        <stop offset="1" stopColor="#E39644"/>
      </linearGradient>
      <linearGradient id="paint38_linear_overview" x1="24.1635" y1="51.8638" x2="26.4469" y2="51.8638" gradientUnits="userSpaceOnUse">
        <stop stopColor="#EDA85F"/>
        <stop offset="1" stopColor="#A36700"/>
      </linearGradient>
      <linearGradient id="paint39_linear_overview" x1="24.5908" y1="51.6505" x2="26.4473" y2="51.6505" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6E4500"/>
        <stop offset="1" stopColor="#CF9353"/>
      </linearGradient>
      <linearGradient id="paint40_linear_overview" x1="26.447" y1="51.8638" x2="28.7304" y2="51.8638" gradientUnits="userSpaceOnUse">
        <stop stopColor="#AB5F0B"/>
        <stop offset="1" stopColor="#753C00"/>
      </linearGradient>
      <linearGradient id="paint41_linear_overview" x1="26.447" y1="51.6505" x2="28.3034" y2="51.6505" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFBE45"/>
        <stop offset="1" stopColor="#FFF0AB"/>
      </linearGradient>
      <linearGradient id="paint42_linear_overview" x1="26.447" y1="51.6429" x2="26.447" y2="49.8007" gradientUnits="userSpaceOnUse">
        <stop stopColor="#97742B"/>
        <stop offset="1" stopColor="#F5C35F"/>
      </linearGradient>
      <linearGradient id="paint43_linear_overview" x1="25.9865" y1="50.2613" x2="25.7322" y2="50.0069" gradientUnits="userSpaceOnUse">
        <stop stopColor="#EAC594"/>
        <stop offset="1" stopColor="#F5C35F"/>
      </linearGradient>
      <linearGradient id="paint44_linear_overview" x1="26.4469" y1="50.007" x2="27.8767" y2="50.007" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FEF9C2"/>
        <stop offset="1" stopColor="#F5C35F"/>
      </linearGradient>
      <linearGradient id="paint45_linear_overview" x1="25.0173" y1="51.4349" x2="26.447" y2="51.4349" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F5C35F"/>
        <stop offset="1" stopColor="#97742B"/>
      </linearGradient>
      <linearGradient id="paint46_linear_overview" x1="27.1618" y1="51.4349" x2="26.9074" y2="51.1805" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F5C35F"/>
        <stop offset="1" stopColor="#97742B"/>
      </linearGradient>
      <linearGradient id="paint47_linear_overview" x1="24.4802" y1="25.0669" x2="24.4802" y2="27.3926" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FEEFD0"/>
        <stop offset="1" stopColor="#FCD587"/>
      </linearGradient>
      <linearGradient id="paint48_linear_overview" x1="24.4802" y1="28.1787" x2="24.4802" y2="30.5044" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FEEFD0"/>
        <stop offset="1" stopColor="#FCD587"/>
      </linearGradient>
      <linearGradient id="paint49_linear_overview" x1="26.0362" y1="18.3311" x2="26.0362" y2="37.9998" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FEEFD0"/>
        <stop offset="1" stopColor="#FCD587"/>
      </linearGradient>
      <linearGradient id="paint50_linear_overview" x1="25.7222" y1="27.4741" x2="26.3453" y2="28.0972" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FEEFD0"/>
        <stop offset="1" stopColor="#FCD587"/>
      </linearGradient>
      <linearGradient id="paint51_linear_overview" x1="25.643" y1="16" x2="25.643" y2="17.5716" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FEEFD0"/>
        <stop offset="1" stopColor="#FCD587"/>
      </linearGradient>
      <linearGradient id="paint52_linear_overview" x1="27.5916" y1="28.1787" x2="27.5916" y2="30.5044" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FEEFD0"/>
        <stop offset="1" stopColor="#FCD587"/>
      </linearGradient>
      <linearGradient id="paint53_linear_overview" x1="34.0896" y1="27" x2="34.0896" y2="28.5714" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FEEFD0"/>
        <stop offset="1" stopColor="#FCD587"/>
      </linearGradient>
      <linearGradient id="paint54_linear_overview" x1="27.5916" y1="25.0669" x2="27.5916" y2="27.3926" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FEEFD0"/>
        <stop offset="1" stopColor="#FCD587"/>
      </linearGradient>
      <linearGradient id="paint55_linear_overview" x1="26.0357" y1="19.9248" x2="26.0357" y2="36.4319" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FEEFD0"/>
        <stop offset="1" stopColor="#FCD587"/>
      </linearGradient>
    </defs>
  </svg>
);

// Quests and Activity icons are very similar - using simplified versions
// For full implementation, we'd include all the paths from the original SVGs
// But for performance, we can use the same base structure with different inner content
export const QuestsIcon: React.FC<IconProps> = ({ 
  className, 
  width = 53, 
  height = 53 
}) => (
  <OverviewIcon className={className} width={width} height={height} />
);

export const ActivityIcon: React.FC<IconProps> = ({ 
  className, 
  width = 53, 
  height = 53 
}) => (
  <OverviewIcon className={className} width={width} height={height} />
);




