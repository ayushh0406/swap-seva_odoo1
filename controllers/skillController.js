import Skill from '../models/Skill.js';
import mongoose from 'mongoose';

// Get all skills
export const getAllSkills = async (req, res) => {
  try {
    const { category, search, limit = 50 } = req.query;
    
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    // Only return active skills
    query.status = 'active';

    const skills = await Skill.find(query)
      .sort({ name: 1 })
      .limit(parseInt(limit))
      .select('name description category image');

    res.status(200).json({
      success: true,
      count: skills.length,
      skills
    });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get skill by ID
export const getSkillById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill ID'
      });
    }

    const skill = await Skill.findById(id);
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.status(200).json({
      success: true,
      skill
    });
  } catch (error) {
    console.error('Get skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new skill (admin only)
export const createSkill = async (req, res) => {
  try {
    const { name, description, category, image } = req.body;
    
    // Validate input
    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, description and category are required'
      });
    }

    // Check if skill already exists
    const existingSkill = await Skill.findOne({ name, category });
    
    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'Skill with this name and category already exists'
      });
    }

    // Create new skill
    const newSkill = await Skill.create({
      name,
      description,
      category,
      image: image || "",
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      skill: newSkill
    });
  } catch (error) {
    console.error('Create skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update skill (admin only)
export const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, image, status } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill ID'
      });
    }

    // Check if skill exists
    const skill = await Skill.findById(id);
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Update fields
    if (name) skill.name = name;
    if (description) skill.description = description;
    if (category) skill.category = category;
    if (image) skill.image = image;
    if (status) skill.status = status;

    await skill.save();

    res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      skill
    });
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete skill (admin only)
export const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill ID'
      });
    }

    const skill = await Skill.findById(id);
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Instead of deleting, set status to inactive
    skill.status = 'inactive';
    await skill.save();

    res.status(200).json({
      success: true,
      message: 'Skill successfully deactivated'
    });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get skill categories
export const getSkillCategories = async (req, res) => {
  try {
    const categories = await Skill.distinct('category', { status: 'active' });
    
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get skill categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 