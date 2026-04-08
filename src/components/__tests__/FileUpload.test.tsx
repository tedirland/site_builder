import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FileUpload } from "../ui/FileUpload";

describe("FileUpload", () => {
  it("accepts a valid pdf file", () => {
    const onFileSelect = vi.fn();
    render(<FileUpload onFileSelect={onFileSelect} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["content"], "resume.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it("accepts a valid docx file", () => {
    const onFileSelect = vi.fn();
    render(<FileUpload onFileSelect={onFileSelect} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["content"], "resume.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it("rejects invalid file types", () => {
    const onFileSelect = vi.fn();
    render(<FileUpload onFileSelect={onFileSelect} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["content"], "photo.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelect).not.toHaveBeenCalled();
    expect(
      screen.getByText("Only .pdf and .docx files are accepted")
    ).toBeInTheDocument();
  });

  it("shows file name after selection", () => {
    render(<FileUpload onFileSelect={vi.fn()} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["content"], "my-resume.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText("my-resume.pdf")).toBeInTheDocument();
  });

  it("shows upload progress when uploading", () => {
    render(<FileUpload onFileSelect={vi.fn()} uploading={true} />);
    // Progress bar should be present
    const progressBar = document.querySelector(".animate-pulse-glow");
    expect(progressBar).toBeInTheDocument();
  });

  it("displays error message", () => {
    render(<FileUpload onFileSelect={vi.fn()} error="Upload failed" />);
    expect(screen.getByText("Upload failed")).toBeInTheDocument();
  });
});
