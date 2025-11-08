import PDFDocument from 'pdfkit';
import Resume from '../models/Resume.js';

export const generateResumePDF = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const { accentColor } = req.body;

        console.log('Generating PDF for resume:', resumeId);

        // Récupérer les données du CV
        const resume = await Resume.findById(resumeId);
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        // Créer un nouveau document PDF
        const doc = new PDFDocument({
            size: 'A4',
            margin: 40
        });

        // Headers pour le streaming
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=resume.pdf');

        // Pipe le PDF directement dans la réponse
        doc.pipe(res);

        // Couleur d'accent (convertir hex en RGB)
        const color = accentColor || '#3B82F6';
        const accentRGB = hexToRgb(color);

        // En-tête avec nom
        doc.fontSize(28)
           .fillColor(accentRGB)
           .text(resume.personal_info?.full_name || 'Your Name', { align: 'left' });

        doc.moveDown(0.3);

        // Profession
        if (resume.personal_info?.profession) {
            doc.fontSize(14)
               .fillColor('#6b7280')
               .text(resume.personal_info.profession, { align: 'left' });
            doc.moveDown(0.3);
        }

        // Informations de contact
        const contactInfo = [];
        if (resume.personal_info?.email) contactInfo.push(resume.personal_info.email);
        if (resume.personal_info?.phone) contactInfo.push(resume.personal_info.phone);
        if (resume.personal_info?.location) contactInfo.push(resume.personal_info.location);

        if (contactInfo.length > 0) {
            doc.fontSize(10)
               .fillColor('#6b7280')
               .text(contactInfo.join(' | '), { align: 'left' });
        }

        doc.moveDown(0.5);

        // Ligne de séparation
        doc.strokeColor(accentRGB)
           .lineWidth(2)
           .moveTo(40, doc.y)
           .lineTo(555, doc.y)
           .stroke();

        doc.moveDown(1);

        // Professional Summary
        if (resume.professional_summary) {
            addSection(doc, 'PROFESSIONAL SUMMARY', accentRGB);
            doc.fontSize(10)
               .fillColor('#1f2937')
               .text(resume.professional_summary, { align: 'justify' });
            doc.moveDown(1);
        }

        // Experience
        if (resume.experience && resume.experience.length > 0) {
            addSection(doc, 'EXPERIENCE', accentRGB);
            resume.experience.forEach((exp, index) => {
                doc.fontSize(12)
                   .fillColor('#1f2937')
                   .text(exp.position || '', { continued: true })
                   .fontSize(10)
                   .fillColor('#6b7280')
                   .text(`  |  ${exp.start_date || ''} - ${exp.end_date || 'Present'}`, { align: 'left' });

                doc.fontSize(10)
                   .fillColor('#6b7280')
                   .text(exp.company || '');

                if (exp.description) {
                    doc.fontSize(10)
                       .fillColor('#1f2937')
                       .text(exp.description, { align: 'justify' });
                }

                if (index < resume.experience.length - 1) doc.moveDown(0.5);
            });
            doc.moveDown(1);
        }

        // Education
        if (resume.education && resume.education.length > 0) {
            addSection(doc, 'EDUCATION', accentRGB);
            resume.education.forEach((edu, index) => {
                const degreeText = `${edu.degree || ''} ${edu.field ? 'in ' + edu.field : ''}`;
                doc.fontSize(12)
                   .fillColor('#1f2937')
                   .text(degreeText, { continued: true })
                   .fontSize(10)
                   .fillColor('#6b7280')
                   .text(`  |  ${edu.graduation_date || ''}`, { align: 'left' });

                doc.fontSize(10)
                   .fillColor('#6b7280')
                   .text(edu.institution || '');

                if (edu.gpa) {
                    doc.fontSize(10)
                       .fillColor('#1f2937')
                       .text(`GPA: ${edu.gpa}`);
                }

                if (index < resume.education.length - 1) doc.moveDown(0.5);
            });
            doc.moveDown(1);
        }

        // Projects
        if (resume.project && resume.project.length > 0) {
            addSection(doc, 'PROJECTS', accentRGB);
            resume.project.forEach((proj, index) => {
                doc.fontSize(12)
                   .fillColor('#1f2937')
                   .text(proj.name || '', { continued: true })
                   .fontSize(10)
                   .fillColor('#6b7280')
                   .text(`  |  ${proj.type || ''}`, { align: 'left' });

                if (proj.description) {
                    doc.fontSize(10)
                       .fillColor('#1f2937')
                       .text(proj.description, { align: 'justify' });
                }

                if (index < resume.project.length - 1) doc.moveDown(0.5);
            });
            doc.moveDown(1);
        }

        // Skills
        if (resume.skills && resume.skills.length > 0) {
            addSection(doc, 'SKILLS', accentRGB);
            doc.fontSize(10)
               .fillColor('#1f2937')
               .text(resume.skills.join(' • '), { align: 'left' });
        }

        // Finaliser le PDF
        doc.end();

        console.log('PDF generated and sent successfully');

    } catch (error) {
        console.error('Error generating PDF:', error);
        if (!res.headersSent) {
            return res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
        }
    }
};

// Fonction helper pour ajouter une section
function addSection(doc, title, accentRGB) {
    doc.fontSize(14)
       .fillColor(accentRGB)
       .text(title, { underline: false });

    const y = doc.y;
    doc.strokeColor(accentRGB)
       .lineWidth(1)
       .moveTo(40, y)
       .lineTo(555, y)
       .stroke();

    doc.moveDown(0.5);
}

// Fonction pour convertir hex en RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [59, 130, 246]; // Default blue
}
