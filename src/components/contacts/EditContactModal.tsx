"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface ContactFormData {
  id: string;
  phone_number: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  date_of_birth?: string;
  job_type?: string;
  expires?: string;
  license_expiration_date?: string;
  status: string;
  others?: string;
  group_id?: string;
}

interface EditContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contact: ContactFormData | null;
}

export function EditContactModal({
  isOpen,
  onClose,
  onSuccess,
  contact,
}: EditContactModalProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    id: "",
    phone_number: "",
    first_name: "",
    last_name: "",
    email: "",
    company: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    date_of_birth: "",
    job_type: "",
    expires: "",
    license_expiration_date: "",
    status: "active",
    preferred_contact_method: "sms",
    others: "",
    group_id: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load contact data when modal opens
  useEffect(() => {
    if (contact && isOpen) {
      setFormData({
        id: contact.id || "",
        phone_number: contact.phone_number || "",
        first_name: contact.first_name || "",
        last_name: contact.last_name || "",
        email: contact.email || "",
        company: contact.company || "",
        address: contact.address || "",
        city: contact.city || "",
        state: contact.state || "",
        zip_code: contact.zip_code || "",
        date_of_birth: contact.date_of_birth || "",
        job_type: contact.job_type || "",
        expires: contact.expires || "",
        license_expiration_date: contact.license_expiration_date || "",
        status: contact.status || "active",
        others: contact.others || "",
        group_id: contact.group_id || "",
      });
    }
  }, [contact, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.phone_number) {
        setError("Phone number is required");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/contacts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update contact");
      }

      // Success - refresh the contacts list and close modal
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error updating contact:", error);
      setError(error.message || "Failed to update contact");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !contact) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-gray-900">Edit Contact</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone Number - Required */}
            <div>
              <label
                htmlFor="phone_number"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="(123) 456-7890"
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="unsubscribed">Unsubscribed</option>
                <option value="bounced">Bounced</option>
              </select>
            </div>

            {/* First Name */}
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                First Name
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="John"
              />
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Last Name
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="john.doe@example.com"
              />
            </div>

            {/* Company */}
            <div>
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Company
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Acme Inc."
              />
            </div>

            {/* Job Type */}
            <div>
              <label
                htmlFor="job_type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Job Type
              </label>
              <input
                type="text"
                id="job_type"
                name="job_type"
                value={formData.job_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nurse"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="123 Main Street"
              />
            </div>

            {/* City */}
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Los Angeles"
              />
            </div>

            {/* State */}
            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="CA"
              />
            </div>

            {/* Zip Code */}
            <div>
              <label
                htmlFor="zip_code"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Zip Code
              </label>
              <input
                type="text"
                id="zip_code"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="90210"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label
                htmlFor="date_of_birth"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date of Birth
              </label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Expires */}
            <div>
              <label
                htmlFor="expires"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Expires
              </label>
              <input
                type="date"
                id="expires"
                name="expires"
                value={formData.expires}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* License Expiration Date */}
            <div>
              <label
                htmlFor="license_expiration_date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                License Expiration Date
              </label>
              <input
                type="date"
                id="license_expiration_date"
                name="license_expiration_date"
                value={formData.license_expiration_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Others */}
            <div className="md:col-span-2">
              <label
                htmlFor="others"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Additional Notes
              </label>
              <textarea
                id="others"
                name="others"
                value={formData.others}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional information about this contact..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Updating..." : "Update Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
