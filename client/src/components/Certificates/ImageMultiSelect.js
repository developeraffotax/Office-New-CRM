// import React, { useEffect, useState, useCallback } from "react";
// import Select, { components, ActionMeta, MultiValue } from "react-select";
// import { CldImage } from "next-cloudinary";

// // Custom Option Component with Overlayed Label on Hover
// const CustomOption = (props) => (
//   <components.Option {...props}>
//     <div className="relative w-full h-full group cursor-pointer">
//       <CldImage
//         src={props.data.value}
//         alt={props.data.label}
//         className="w-full h-[200px] object-cover rounded transition-transform duration-300 transform group-hover:scale-105"
//         width={200}
//         height={150}
//         priority
//       />
//       {/* Label Overlay */}
//       <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 rounded">
//         <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//           {props.data.label}
//         </span>
//       </div>
//     </div>
//   </components.Option>
// );

// // Custom MultiValue Label Component with Thumbnail and Transparent Background
// const CustomMultiValueLabel = (props) => (
//   <components.MultiValueLabel {...props}>
//     <div className="flex items-center space-x-1">
//       <CldImage
//         src={props.data.value}
//         alt={props.data.label}
//         className="w-5 h-5 object-cover rounded"
//         width={50}
//         height={50}
//         priority
//       />
//       <span className="text-xs text-gray-700 dark:text-gray-300">
//         {props.data.label}
//       </span>
//     </div>
//   </components.MultiValueLabel>
// );

// // Styles Configuration for react-select
// const customStyles = {
//   // Your custom styles here
// };

// const ImageMultiSelect = ({ selectedImages, setSelectedImages }) => {
//   const [options, setOptions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Fetch saved certificates from the API
//   const fetchImages = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await fetch("/api/certificates/get-saved");

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();

//       if (!data.certificates || !Array.isArray(data.certificates)) {
//         throw new Error("Invalid data format received from API.");
//       }

//       // Map the certificates to ImageOption format
//       const fetchedImages = data.certificates.map((cert) => ({
//         value: cert.certificateData,
//         label: cert.description || `Certificate ${cert.uniqueIdentifier}`,
//       }));

//       setOptions(fetchedImages);
//     } catch (error) {
//       console.error("Error fetching existing images:", error);
//       setError("Failed to load certificates. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchImages();
//   }, [fetchImages]);

//   // Handle selection changes
//   const handleChange = (selected, actionMeta) => {
//     const selectedOptions = selected ? [...selected] : [];
//     setSelectedImages(selectedOptions);
//   };

//   return (
//     <div className="w-full">
//       <label className="block text-sm font-medium text-gray-700 mb-1">
//         Select Existing Certificates
//       </label>
//       {error && (
//         <p className="text-sm text-red-600 mb-2" role="alert">
//           {error}
//         </p>
//       )}
//       <Select
//         isMulti
//         options={options}
//         value={selectedImages}
//         onChange={handleChange}
//         isLoading={loading}
//         placeholder="Select certificates..."
//         className="react-select-container"
//         classNamePrefix="react-select"
//         components={{
//           Option: CustomOption,
//           MultiValueLabel: CustomMultiValueLabel,
//         }}
//         styles={customStyles}
//         noOptionsMessage={() =>
//           loading ? "Loading certificates..." : "No certificates available"
//         }
//         isSearchable
//         aria-label="Select Existing Certificates"
//       />
//     </div>
//   );
// };

// export default ImageMultiSelect;
